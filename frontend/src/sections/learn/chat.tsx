import type { Language } from "src/locales/types";

import { DeepChat } from "deep-chat-react";
import { varAlpha } from "minimal-shared/utils";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { CONFIG } from "src/global-config";
import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { useUserContext } from "src/components/user";

type ChatProps = {
  placeholder?: string;
  errorMessage?: string;
  history?: { text: string; role: "user" | "ai" }[];
  url: string;
  language: Language;
};

export function Chat({ url, placeholder, errorMessage, history, language }: ChatProps) {
  const {
    state: { avatarUrl },
  } = useUserContext();

  const theme = useTheme();

  return (
    <Box sx={{ height: 1, width: 1 }}>
      <DeepChat
        style={{
          borderRadius: "10px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        messageStyles={{
          default: {
            shared: {
              bubble: {
                maxWidth: "100%",
                backgroundColor: "unset",
                marginTop: "10px",
                marginBottom: "10px",
              },
            },
            user: {
              bubble: {
                marginLeft: "0px",
                color: theme.palette.common.black,
              },
            },
            ai: {
              outerContainer: {
                backgroundColor: varAlpha(theme.vars.palette.grey["500Channel"], 0.1),
                borderTop: `1px solid ${varAlpha(theme.vars.palette.common.blackChannel, 0.1)}`,
                borderBottom: `1px solid ${varAlpha(theme.vars.palette.common.blackChannel, 0.1)}`,
              },
            },
          },
        }}
        avatars={{
          default: { styles: { position: "left" } },
          ai: {
            src: `${CONFIG.assetsDir}/assets/images/openai.png`,
            styles: { avatar: { borderRadius: "50%" } },
          },
          user: {
            src: avatarUrl || DEFAULT_AVATAR_URL,
            styles: { avatar: { borderRadius: "50%" } },
          },
        }}
        errorMessages={{
          overrides: {
            service: errorMessage || "Target service error!",
          },
        }}
        submitButtonStyles={{
          submit: {
            container: {
              default: {
                backgroundColor: theme.palette.common.black,
                borderRadius: "50%",
              },
            },
            svg: {
              content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115.4 122.88"><path d="M24.94,67.88A14.66,14.66,0,0,1,4.38,47L47.83,4.21a14.66,14.66,0,0,1,20.56,0L111,46.15A14.66,14.66,0,0,1,90.46,67.06l-18-17.69-.29,59.17c-.1,19.28-29.42,19-29.33-.25L43.14,50,24.94,67.88Z"/></svg>`,
              styles: {
                default: {
                  filter:
                    "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(315deg) brightness(99%) contrast(102%)",
                  transform: "scale(0.95)",
                  padding: "0.4em",
                },
              },
            },
          },
          loading: {
            container: {
              default: { backgroundColor: theme.palette.common.white },
            },
            svg: {
              styles: {
                default: {
                  filter:
                    "brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%) contrast(96%)",
                },
              },
            },
          },
          stop: {
            container: {
              default: { backgroundColor: theme.palette.common.white },
              hover: { backgroundColor: theme.palette.common.background },
            },
            svg: {
              content: `<?xml version="1.0" encoding="utf-8"?> 
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> 
                <rect width="24" height="24" rx="4" ry="4" /> 
              </svg>`,
              styles: {
                default: {
                  width: "0.95em",
                  marginTop: "0.32em",
                  filter:
                    "brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%) contrast(96%)",
                },
              },
            },
          },
        }}
        textInput={{
          placeholder: {
            text: placeholder,
          },
          styles: {
            container: {
              boxShadow: "none",
              borderRadius: "1em",
              border: `1px solid ${varAlpha(theme.vars.palette.common.blackChannel, 0.2)}`,
            },
            text: {
              padding: "0.4em 0.8em",
              paddingRight: "2.5em",
            },
          },
        }}
        history={history}
        connect={{
          stream: true,
          url,
          method: "POST",
          credentials: "include",
          headers: {
            "Accept-Language": language,
          },
        }}
      />
    </Box>
  );
}
