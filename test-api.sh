#!/bin/bash

echo "=== API Test Script ==="
echo ""

#ヘルスチェック
echo "1. Health Check"
curl http://localhost:3001/health
echo -e "\n"

#ユーザー登録
echo "2. Register User"
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/users/register \
   -H "Content-Type: application/json" \
   -d '{
   "email": "test@example.com",
   "password":"password123",
   "name": "Test User"
    }')
echo "$USER_RESPONSE" | jq '.'
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data.id')
echo "User ID: $USER_ID"
echo ""

# 記事作成
echo "3. Create Post"
POST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "tempAuthorId": "'"$USER_ID"'", 
    "title": "初めての記事",
    "content": "これはテスト記事です。TypeScript + Expressで作成しました。",
    "tags": ["TypeScript", "Express", "API"],
    "status": "published"
  }')
  echo $POST_RESPONSE | jq '.'
  POST_ID=$(echo $POST_RESPONSE | jq -r '.data.id')
  echo "Post ID: $POST_ID"
  echo ""




# 記事一覧取得
echo "4. Get All Posts"
curl -s http://localhost:3001/api/posts | jq '.'
echo ""

# 記事詳細取得
echo "5. Get Post by ID"
curl -s http://localhost:3001/api/posts/$POST_ID | jq '.'
echo ""

# 記事更新
echo "6. Update Post"
curl -s -X PUT http://localhost:3001/api/posts/$POST_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"tempAuthorId\": \"$USER_ID\",
    \"title\": \"更新された記事(TypeScriptについて)\",
    \"content\": \"記事を更新しましたが、TypeScript関連の記述は残しました。\"
  }" | jq '.'
echo ""

# コメント作成
echo "7. Create Comment"
COMMENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -d "{
    \"tempAuthorId\": \"$USER_ID\",
    \"postId\": \"$POST_ID\",
    \"content\": \"素晴らしい記事です！\"
  }")
echo $COMMENT_RESPONSE | jq '.'
COMMENT_ID=$(echo $COMMENT_RESPONSE | jq -r '.data.id')
echo ""

# コメント一覧取得
echo "8. Get Comments"
curl -s http://localhost:3001/api/comments/posts/$POST_ID/comments | jq '.'
echo ""

# 検索テスト
echo "9. Search Posts by Keyword"
curl -s "http://localhost:3001/api/posts?keyword=TypeScript" | jq '.'
echo ""

echo "=== Test Complete ==="np