from flask import Blueprint, request, jsonify
from app.models import Project
from app.utils.validators import validate_project_data

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
def get_projects():
    """获取所有项目列表"""
    try:
        projects = Project.get_all_projects()
        return jsonify({
            'success': True,
            'data': [project.to_dict() for project in projects],
            'count': len(projects)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取项目列表失败',
            'message': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """获取单个项目详情"""
    try:
        project = Project.get_project_by_id(project_id)
        if not project:
            return jsonify({
                'success': False,
                'error': '项目未找到',
                'message': f'ID为{project_id}的项目不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': project.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取项目详情失败',
            'message': str(e)
        }), 500

@projects_bp.route('/projects', methods=['POST'])
def create_project():
    """创建新项目"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供项目数据'
            }), 400
        
        # 验证数据
        errors = validate_project_data(data)
        if errors:
            return jsonify({
                'success': False,
                'error': '数据验证失败',
                'message': '; '.join(errors)
            }), 400
        
        # 准备项目数据
        project_data = {
            'name': data['name'].strip(),
            'description': data.get('description', '').strip() or None,
            'start_date': data['start_date'],
            'end_date': data['end_date']
        }
        
        # 创建项目
        project = Project.create_project(project_data)
        
        return jsonify({
            'success': True,
            'data': project.to_dict(),
            'message': '项目创建成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '创建项目失败',
            'message': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """更新项目"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供要更新的数据'
            }), 400
        
        # 检查项目是否存在
        project = Project.get_project_by_id(project_id)
        if not project:
            return jsonify({
                'success': False,
                'error': '项目未找到',
                'message': f'ID为{project_id}的项目不存在'
            }), 404
        
        # 验证数据
        errors = validate_project_data(data)
        if errors:
            return jsonify({
                'success': False,
                'error': '数据验证失败',
                'message': '; '.join(errors)
            }), 400
        
        # 准备更新数据
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name'].strip()
        if 'description' in data:
            update_data['description'] = data.get('description', '').strip() or None
        if 'start_date' in data:
            update_data['start_date'] = data['start_date']
        if 'end_date' in data:
            update_data['end_date'] = data['end_date']
        
        # 更新项目
        updated_project = Project.update_project(project_id, update_data)
        
        return jsonify({
            'success': True,
            'data': updated_project.to_dict(),
            'message': '项目更新成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '更新项目失败',
            'message': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """删除项目"""
    try:
        project = Project.get_project_by_id(project_id)
        if not project:
            return jsonify({
                'success': False,
                'error': '项目未找到',
                'message': f'ID为{project_id}的项目不存在'
            }), 404
        
        success = Project.delete_project(project_id)
        if success:
            return jsonify({
                'success': True,
                'message': '项目删除成功'
            })
        else:
            return jsonify({
                'success': False,
                'error': '删除项目失败',
                'message': '删除项目时发生错误'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '删除项目失败',
            'message': str(e)
        }), 500