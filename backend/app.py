from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import re
from fuzzywuzzy import fuzz
import html
import logging
from sqlalchemy.exc import OperationalError
from models import db, User, Product, ChatHistory

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey123'

db.init_app(app)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    app=app
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    pass

main_bp = Blueprint('main', __name__)


@main_bp.route('/signup', methods=['POST'])
@limiter.limit("10 per minute")
def signup():
    try:
        data = request.json
        if not all(key in data for key in ['username', 'password', 'name', 'email']):
            return jsonify({'error': 'Please provide all required fields'}), 400

        username = html.escape(data['username'].strip())
        email = html.escape(data['email'].strip())
        name = html.escape(data['name'].strip())

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username is already taken'}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email is already registered'}), 409

        hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(
            username=username,
            password=hashed_pw,
            name=name,
            email=email
        )

        db.session.add(new_user)
        db.session.commit()
        logger.info(f"User {username} signed up successfully")
        return jsonify({'message': 'Account created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@main_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        data = request.json
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'Please provide username and password'}), 400

        username = html.escape(data['username'].strip())
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401

        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        logger.info(f"User {username} logged in")
        return jsonify({
            'token': token,
            'user_id': user.id,
            'name': user.name
        })
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@main_bp.route('/user/<int:user_id>', methods=['GET'])
@limiter.limit("50 per minute")
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email
        })
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@main_bp.route('/chat', methods=['POST'])
@limiter.limit("50 per minute")
def chat():
    try:
        data = request.json
        user_id = data.get('user_id')
        user_input = html.escape(data.get('message', '').strip().lower())

        if not user_id or not user_input:
            return jsonify({'error': 'Please provide user ID and message'}), 400

        # Save user message
        db.session.add(ChatHistory(user_id=user_id, message=user_input, sender='user'))
        db.session.commit()

        user = User.query.get(user_id)
        user_name = user.name.split()[0] if user else "there"

        keywords = re.findall(r'\b\w+\b', user_input)

        # Fuzzy category detection
        categories = {
            'Electronics': ['phone', 'smartphone', 'mobile', 'headphone', 'laptop', 'tv', 'speaker', 'gadget', 'tablet', 'smartwatch'],
            'Books': ['book', 'novel', 'textbook', 'fiction', 'non-fiction', 'literature', 'ebook', 'paperback'],
            'Clothing': ['shirt', 't-shirt', 'jeans', 'dress', 'jacket', 'legging', 'sneaker', 'scarf', 'clothing', 'sweater', 'trousers']
        }

        category = None
        for cat, keywords_list in categories.items():
            if any(any(fuzz.ratio(k, kw) > 80 for kw in keywords_list) for k in keywords):
                category = cat
                break

        # Price parsing
        max_price = min_price = None
        try:
            max_price = float(re.search(r'(?:under|below|less than)\\s+₹?([\\d,]+)', user_input).group(1).replace(',', ''))
        except:
            pass
        try:
            min_price = float(re.search(r'(?:over|above|more than)\\s+₹?([\\d,]+)', user_input).group(1).replace(',', ''))
        except:
            pass

        # Feature matching
        feature_keywords = [
            'waterproof', 'bluetooth', 'fast charging', 'lightweight', 'eco-friendly',
            'cotton', 'fiction', 'non-fiction', '5g', '4k', 'noise cancelling', 'smart',
            'casual', 'wireless', 'organic', 'hardcover', 'portable', 'high-resolution'
        ]
        features = [f for f in feature_keywords if any(fuzz.ratio(f, k) > 80 for k in keywords)]

        # Jargon Detection (no relevant signal)
        name_query = ' '.join(keywords)
        probable_match = Product.query.filter(Product.name.ilike(f'%{name_query}%')).first()
        if not (category or features or max_price or min_price or probable_match):
            reply = f"Hey {user_name}, I didn’t quite get that. 🤔 Are you looking for something in Electronics, Books, or Clothing?"
            db.session.add(ChatHistory(user_id=user_id, message=reply, sender='bot'))
            db.session.commit()
            return jsonify({'reply': reply, 'products': [], 'suggestions': ["smartphones under ₹20000", "fiction books", "casual clothing"]})

        # Build Product Query
        query = Product.query
        if category:
            query = query.filter(Product.category == category)
        if max_price:
            query = query.filter(Product.price <= max_price)
        if min_price:
            query = query.filter(Product.price >= min_price)
        if features:
            for feature in features:
                query = query.filter(Product.features.ilike(f'%{feature}%'))

        products = query.order_by(Product.price.asc()).limit(5).all()

        # Generate bot response
        suggestions = []
        if not products:
            reply = f"Sorry {user_name}, I couldn’t find any results for your query."
            suggestions = ["smartphones under ₹20000", "fiction books", "cotton clothing"]
        else:
            reply = f"Found {len(products)} product{'s' if len(products) > 1 else ''}"
            filters = []
            if category: filters.append(category.lower())
            if max_price: filters.append(f"under ₹{int(max_price):,}")
            if min_price: filters.append(f"above ₹{int(min_price):,}")
            if features: filters.append(f"with {', '.join(features)}")
            if filters: reply += f" matching {' and '.join(filters)}."
            else: reply += " matching your query."

        # Save bot reply
        db.session.add(ChatHistory(user_id=user_id, message=reply, sender='bot'))
        db.session.commit()

        product_list = [{
            'name': p.name,
            'category': p.category,
            'price': float(p.price),
            'features': p.features.split(',') if p.features else []
        } for p in products]

        return jsonify({
            'reply': reply,
            'products': product_list,
            'suggestions': suggestions
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@main_bp.route('/history/<int:user_id>', methods=['GET'])
def history(user_id):
    history = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.asc()).all()
    messages = [{
        'sender': h.sender,
        'text': h.message,
        'timestamp': h.timestamp.isoformat()
    } for h in history]
    return jsonify(messages)


app.register_blueprint(main_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Seed database with sample products if empty
        if not Product.query.first():
            sample_products = [
                Product(name="Smartphone X1", category="Electronics", price=15000, features="waterproof,5G,fast charging"),
                Product(name="Laptop Pro", category="Electronics", price=60000, features="lightweight,high-resolution,16GB RAM"),
                Product(name="Fiction Novel", category="Books", price=800, features="fiction,paperback,bestseller"),
                Product(name="Cotton T-Shirt", category="Clothing", price=1200, features="cotton,casual,breathable"),
                Product(name="Wireless Headphones", category="Electronics", price=5000, features="bluetooth,noise cancelling,wireless"),
                Product(name="Smartwatch Z", category="Electronics", price=10000, features="waterproof,bluetooth,fitness tracking"),
                Product(name="Non-Fiction Book", category="Books", price=1200, features="non-fiction,hardcover,educational"),
                Product(name="Jeans Slim Fit", category="Clothing", price=2500, features="cotton,casual,durable"),
                Product(name="Portable Speaker", category="Electronics", price=3000, features="bluetooth,portable,waterproof"),
                Product(name="Summer Dress", category="Clothing", price=2000, features="cotton,lightweight,casual")
            ]
            db.session.bulk_save_objects(sample_products)
            db.session.commit()
            logger.info("Database seeded with sample products")

    app.run(debug=True)