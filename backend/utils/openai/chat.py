import requests
import json
from global_config import CONFIG


class OpenAIChat:
    def __init__(self):
        self.URL = "https://api.openai.com/v1/chat/completions"
        self.HEADERS = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + CONFIG["open_ai_api_key"],
        }

    @staticmethod
    def create_chat_body(body):
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        chat_body = {
            "messages": [
                {
                    "role": "assistant" if message["role"] == "ai" else message["role"],
                    "content": message["text"],
                }
                for message in body["messages"]
            ],
            "model": body["model"],
        }
        chat_body["stream"] = True
        return chat_body

    def _send_request(self, body):
        return requests.post(
            self.URL,
            json=body,
            headers=self.HEADERS,
            stream=True,
        )

    def chat(self, body):
        response = self._send_request(body)

        def generate():
            # increase chunk size if getting errors for long messages
            for chunk in response.iter_content(chunk_size=2048):
                if chunk:
                    if not (chunk.decode().strip().startswith("data")):
                        errorMessage = json.loads(chunk.decode())["error"]["message"]
                        print("Error in the retrieved stream chunk:", errorMessage)
                        # this exception is not caught, however it signals to the user that there was an error
                        raise Exception(errorMessage)
                    lines = chunk.decode().split("\n")
                    filtered_lines = list(filter(lambda line: line.strip(), lines))
                    for line in filtered_lines:
                        data = (
                            line.replace("data:", "")
                            .replace("[DONE]", "")
                            .replace("data: [DONE]", "")
                            .strip()
                        )
                        if data:
                            try:
                                result = json.loads(data)
                                content = (
                                    result["choices"][0]
                                    .get("delta", {})
                                    .get("content", "")
                                )
                                # Sends response back to Deep Chat using the Response format:
                                # https://deepchat.dev/docs/connect/#Response
                                yield "data: {}\n\n".format(
                                    json.dumps({"text": content})
                                )
                            except json.JSONDecodeError:
                                # Incomplete JSON string, continue accumulating lines
                                pass

        return generate()
