#!/usr/bin/env bash
PROJECT='portal'
TARGET_FOLDER='~/driver-server/static-root/public/common-portal/'
FOLDER_NAME=$PROJECT
ASSETS='assets'

echo "clean and build sources"
rm -r $FOLDER_NAME
npm run clean:$PROJECT
npm run build:$PROJECT
mv $PROJECT $FOLDER_NAME

echo "erase $FOLDER_NAME"
ssh $1 "cd $TARGET_FOLDER && rm -r $FOLDER_NAME"

echo "upload $FOLDER_NAME to $1"
scp -r $FOLDER_NAME $1:$TARGET_FOLDER