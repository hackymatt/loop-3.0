Build docker:
docker build -t loopedupl/nginx:latest ./nginx

Push docker:
docker push loopedupl/nginx:latest

Create secrets:
kubectl delete secret auth
kubectl create secret generic auth --from-file=./auth

Delete cert:
kubectl delete cert tls-cert
