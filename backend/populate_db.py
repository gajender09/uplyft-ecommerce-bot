from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False, index=True)
    features = db.Column(db.String(250), nullable=False)

def populate_products():
    categories = ['Electronics', 'Books', 'Clothing']
    electronics = [
        ('Smartphone', ['5G', 'waterproof', 'fast charging', 'high-resolution']),
        ('Laptop', ['lightweight', 'bluetooth', 'high-resolution']),
        ('Headphones', ['noise cancelling', 'wireless', 'bluetooth']),
        ('Smartwatch', ['waterproof', 'smart', 'bluetooth']),
        ('Tablet', ['portable', 'high-resolution', 'bluetooth'])
    ]
    books = [
        ('Fiction Novel', ['fiction', 'paperback', 'bestselling']),
        ('Non-Fiction Book', ['non-fiction', 'hardcover', 'educational']),
        ('Textbook', ['educational', 'hardcover']),
        ('Mystery Novel', ['fiction', 'paperback']),
        ('Biography', ['non-fiction', 'hardcover'])
    ]
    clothing = [
        ('T-Shirt', ['cotton', 'casual', 'breathable']),
        ('Jeans', ['casual', 'durable']),
        ('Jacket', ['waterproof', 'lightweight']),
        ('Dress', ['cotton', 'elegant']),
        ('Sweater', ['warm', 'casual'])
    ]

    products = []
    for _ in range(100):
        category = random.choice(categories)
        if category == 'Electronics':
            base_product, features = random.choice(electronics)
            name = f"{base_product} {random.randint(1, 1000)}"
        elif category == 'Books':
            base_product, features = random.choice(books)
            name = f"{base_product} {random.randint(1, 1000)}"
        else:
            base_product, features = random.choice(clothing)
            name = f"{base_product} {random.randint(1, 1000)}"
        
        price = round(random.uniform(500, 50000), 2)
        selected_features = random.sample(features, min(len(features), random.randint(1, 3)))
        products.append(Product(
            name=name,
            category=category,
            price=price,
            features=', '.join(selected_features)
        ))

    with app.app_context():
        db.drop_all()
        db.create_all()
        db.session.bulk_save_objects(products)
        db.session.commit()
        print(f"Added {len(products)} products to the database.")

if __name__ == '__main__':
    populate_products()