#!/bin/bash
cd /home/kavia/workspace/code-generation/interviewmentor-ai-24635-3e2a91f6/interview_mentor_web_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

