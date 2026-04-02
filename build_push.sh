#/bin/bash
docker build -t accola.local:5000/kafe-dashboard:latest . && \
docker push accola.local:5000/kafe-dashboard:latest
