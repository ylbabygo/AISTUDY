from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from app import db, migrate

# 加载环境变量
load_dotenv()

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
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': '服务器内部错误',
            'message': '服务器遇到了意外错误'
        }), 500
    
    @app.errorhandler(413)
    def too_large(error):
        return jsonify({
            'success': False,
            'error': '文件过大',
            'message': '上传的文件超过了允许的大小限制'
        }), 413
    
    # 健康检查端点
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': '项目管理系统API运行正常'
        })
    
    # 根路径
    @app.route('/')
    def index():
        return jsonify({
            'message': '欢迎使用项目管理系统API',
            'version': '1.0.0',
            'endpoints': {
                'projects': '/api/projects',
                'tasks': '/api/tasks',
                'documents': '/api/documents',
                'timer': '/api/timer'
            }
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 确保上传目录存在
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    )