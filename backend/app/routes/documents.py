from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from app.models import Document, Task
from app.utils.validators import allowed_file
import os

documents_bp = Blueprint('documents', __name__)

# 获取上传文件夹路径
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@documents_bp.route('/tasks/<int:task_id>/documents', methods=['GET'])
def get_task_documents(task_id):
    """获取任务的所有文档"""
    try:
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        documents = Document.get_documents_by_task(task_id)
        
        return jsonify({
            'success': True,
            'data': [doc.to_dict() for doc in documents],
            'count': len(documents)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取文档列表失败',
            'message': str(e)
        }), 500

@documents_bp.route('/tasks/<int:task_id>/documents', methods=['POST'])
def upload_document(task_id):
    """上传文档到指定任务"""
    try:
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有文件',
                'message': '请选择要上传的文件'
            }), 400
        
        file = request.files['file']
        
        # 检查文件是否为空
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '文件名为空',
                'message': '请选择有效的文件'
            }), 400
        
        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': '文件类型不允许',
                'message': '只允许上传PDF、图片(PNG/JPG/JPEG/GIF)和文档(DOC/DOCX)文件'
            }), 400
        
        # 创建文档记录并保存文件
        document = Document.create_document(task_id, file, UPLOAD_FOLDER)
        
        return jsonify({
            'success': True,
            'data': document.to_dict(),
            'message': '文件上传成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '上传文件失败',
            'message': str(e)
        }), 500

@documents_bp.route('/documents/<int:document_id>', methods=['GET'])
def download_document(document_id):
    """下载文档"""
    try:
        document = Document.get_document_by_id(document_id)
        if not document:
            return jsonify({
                'success': False,
                'error': '文档未找到',
                'message': f'ID为{document_id}的文档不存在'
            }), 404
        
        # 检查文件是否存在
        if not os.path.exists(document.file_path):
            return jsonify({
                'success': False,
                'error': '文件不存在',
                'message': '文档文件在服务器上不存在'
            }), 404
        
        # 发送文件
        return send_file(
            document.file_path,
            as_attachment=True,
            download_name=document.original_filename,
            mimetype=None
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '下载文件失败',
            'message': str(e)
        }), 500

@documents_bp.route('/documents/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    """删除文档"""
    try:
        document = Document.get_document_by_id(document_id)
        if not document:
            return jsonify({
                'success': False,
                'error': '文档未找到',
                'message': f'ID为{document_id}的文档不存在'
            }), 404
        
        success = Document.delete_document(document_id)
        if success:
            return jsonify({
                'success': True,
                'message': '文档删除成功'
            })
        else:
            return jsonify({
                'success': False,
                'error': '删除文档失败',
                'message': '删除文档时发生错误'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '删除文档失败',
            'message': str(e)
        }), 500

@documents_bp.route('/documents/<int:document_id>/info', methods=['GET'])
def get_document_info(document_id):
    """获取文档信息"""
    try:
        document = Document.get_document_by_id(document_id)
        if not document:
            return jsonify({
                'success': False,
                'error': '文档未找到',
                'message': f'ID为{document_id}的文档不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': document.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取文档信息失败',
            'message': str(e)
        }), 500