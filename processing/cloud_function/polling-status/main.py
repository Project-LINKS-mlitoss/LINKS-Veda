from flask import jsonify, Flask
from pymongo import MongoClient
import os
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')


def polling_status(request):
    global client
    try:
        ticketId = request.args.get('ticketId')
        escaped_user = quote_plus(USER_AUTH)
        escaped_password = quote_plus(PASSWORD_MONGODB)
        client = MongoClient(MONGO_CLIENT.replace("://", f"://{escaped_user}:{escaped_password}@"))
        db = client[MONGO_DB]
        collection = db[MONGO_COLLECTION]

        data = collection.find_one({"_id": ticketId})
        if not data:
            return jsonify({"error": "チケットが見つかりません"}), 400
        data.pop('created_at', None)
        data.pop('updated_at', None)
        data['ticket_id'] = data.pop('_id')
        return jsonify(data)
    except BaseException as e:
        print(e)
        return jsonify({"error": "処理失敗しました"}), 500
    finally:
        client.close()
