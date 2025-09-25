from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 初始化扩展
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///project_management.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
    
    # CORS配置
    CORS(app, origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','))
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    
    # 注册蓝图
    from app.routes.projects import projects_bp
    from app.routes.tasks import tasks_bp
    from app.routes.documents import documents_bp
    from app.routes.timer import timer_bp
    
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')
    app.register_blueprint(documents_bp, url_prefix='/api')
    app.register_blueprint(timer_bp, url_prefix='/api')
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': '资源未找到',
            'message': '请求的资源不存在'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': '服务器内部错误',
            'message': '服务器遇到了一个错误，请稍后重试'
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': '请求错误',
            'message': '请求格式不正确'
        }), 400
    
    # 健康检查端点
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'success': True,
            'message': '服务运行正常',
            'status': 'healthy'
        })
    
    return app