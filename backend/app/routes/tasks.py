from flask import Blueprint, request, jsonify
from app.models import Task, TimeLog
from app.utils.validators import validate_task_data

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表"""
    try:
        project_id = request.args.get('project_id', type=int)
        status = request.args.get('status')
        
        if project_id:
            if status:
                tasks = Task.get_tasks_by_status(status, project_id)
            else:
                tasks = Task.get_tasks_by_project(project_id)
        else:
            if status:
                tasks = Task.get_tasks_by_status(status)
            else:
                # 获取所有任务
                from app import db
                tasks = Task.query.order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [task.to_dict() for task in tasks],
            'count': len(tasks)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取任务列表失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """获取单个任务详情"""
    try:
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': task.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取任务详情失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """创建新任务"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供任务数据'
            }), 400
        
        # 验证数据
        errors = validate_task_data(data)
        if errors:
            return jsonify({
                'success': False,
                'error': '数据验证失败',
                'message': '; '.join(errors)
            }), 400
        
        # 准备任务数据
        task_data = {
            'project_id': data['project_id'],
            'title': data['title'].strip(),
            'description': data.get('description', '').strip() or None,
            'status': data.get('status', 'todo'),
            'assignee': data.get('assignee', '').strip() or None,
            'priority': data.get('priority', 'medium'),
            'depends_on': data.get('depends_on')
        }
        
        # 处理时间数据
        if data.get('start_time'):
            from datetime import datetime
            task_data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        
        if data.get('end_time'):
            from datetime import datetime
            task_data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        # 创建任务
        task = Task.create_task(task_data)
        
        return jsonify({
            'success': True,
            'data': task.to_dict(),
            'message': '任务创建成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '创建任务失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """更新任务"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供要更新的数据'
            }), 400
        
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        # 验证数据
        errors = validate_task_data(data)
        if errors:
            return jsonify({
                'success': False,
                'error': '数据验证失败',
                'message': '; '.join(errors)
            }), 400
        
        # 准备更新数据
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title'].strip()
        if 'description' in data:
            update_data['description'] = data.get('description', '').strip() or None
        if 'status' in data:
            update_data['status'] = data['status']
        if 'assignee' in data:
            update_data['assignee'] = data.get('assignee', '').strip() or None
        if 'priority' in data:
            update_data['priority'] = data['priority']
        if 'depends_on' in data:
            update_data['depends_on'] = data['depends_on']
        
        # 处理时间数据
        if 'start_time' in data:
            from datetime import datetime
            update_data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        if 'end_time' in data:
            from datetime import datetime
            update_data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        # 更新任务
        updated_task = Task.update_task(task_id, update_data)
        
        return jsonify({
            'success': True,
            'data': updated_task.to_dict(),
            'message': '任务更新成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '更新任务失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    try:
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        success = Task.delete_task(task_id)
        if success:
            return jsonify({
                'success': True,
                'message': '任务删除成功'
            })
        else:
            return jsonify({
                'success': False,
                'error': '删除任务失败',
                'message': '删除任务时发生错误'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '删除任务失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/tasks/<int:task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    """更新任务状态（用于拖拽）"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': '状态不能为空',
                'message': '请提供新的任务状态'
            }), 400
        
        if new_status not in ['todo', 'in_progress', 'done']:
            return jsonify({
                'success': False,
                'error': '无效的状态',
                'message': '任务状态必须是todo、in_progress或done'
            }), 400
        
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        # 更新状态
        updated_task = Task.update_task_status(task_id, new_status)
        
        return jsonify({
            'success': True,
            'data': updated_task.to_dict(),
            'message': '任务状态更新成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '更新任务状态失败',
            'message': str(e)
        }), 500

@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
def create_project_task(project_id):
    """为特定项目创建任务"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供任务数据'
            }), 400
        
        # 添加项目ID到数据中
        data['project_id'] = project_id
        
        # 验证数据
        errors = validate_task_data(data)
        if errors:
            return jsonify({
                'success': False,
                'error': '数据验证失败',
                'message': '; '.join(errors)
            }), 400
        
        # 准备任务数据
        task_data = {
            'project_id': project_id,
            'title': data['title'].strip(),
            'description': data.get('description', '').strip() or None,
            'status': data.get('status', 'todo'),
            'assignee': data.get('assignee', '').strip() or None,
            'priority': data.get('priority', 'medium'),
            'depends_on': data.get('depends_on')
        }
        
        # 处理时间数据
        if data.get('start_time'):
            from datetime import datetime
            task_data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        
        if data.get('end_time'):
            from datetime import datetime
            task_data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        # 创建任务
        task = Task.create_task(task_data)
        
        return jsonify({
            'success': True,
            'data': task.to_dict(),
            'message': '任务创建成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '创建任务失败',
            'message': str(e)
        }), 500