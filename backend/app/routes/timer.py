from flask import Blueprint, request, jsonify
from app.models import TimeLog, Task

timer_bp = Blueprint('timer', __name__)

@timer_bp.route('/tasks/<int:task_id>/timer', methods=['POST'])
def control_timer(task_id):
    """控制任务计时器"""
    try:
        data = request.get_json()
        if not data or 'action' not in data:
            return jsonify({
                'success': False,
                'error': '缺少操作参数',
                'message': '请提供操作类型（start/stop）'
            }), 400
        
        action = data['action'].lower()
        description = data.get('description', '').strip() or None
        
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        if action == 'start':
            # 开始计时
            timer = TimeLog.start_timer(task_id, description)
            if timer:
                return jsonify({
                    'success': True,
                    'data': timer.to_dict(),
                    'message': '计时器已启动'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': '启动计时器失败',
                    'message': '无法启动计时器'
                }), 500
                
        elif action == 'stop':
            # 停止计时
            timer = TimeLog.stop_timer(task_id, description)
            if timer:
                return jsonify({
                    'success': True,
                    'data': timer.to_dict(),
                    'message': '计时器已停止'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': '停止计时器失败',
                    'message': '没有找到正在运行的计时器'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': '无效的操作',
                'message': '操作必须是start或stop'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '操作计时器失败',
            'message': str(e)
        }), 500

@timer_bp.route('/tasks/<int:task_id>/time-logs', methods=['GET'])
def get_task_time_logs(task_id):
    """获取任务的时间日志"""
    try:
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        time_logs = TimeLog.get_time_logs_by_task(task_id)
        
        return jsonify({
            'success': True,
            'data': [log.to_dict() for log in time_logs],
            'count': len(time_logs),
            'total_time': TimeLog.get_total_time_by_task(task_id)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取时间日志失败',
            'message': str(e)
        }), 500

@timer_bp.route('/time-logs/<int:log_id>', methods=['PUT'])
def update_time_log(log_id):
    """更新时间日志"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': '请求数据为空',
                'message': '请提供要更新的数据'
            }), 400
        
        # 查找时间日志
        time_log = TimeLog.query.get(log_id)
        if not time_log:
            return jsonify({
                'success': False,
                'error': '时间日志未找到',
                'message': f'ID为{log_id}的时间日志不存在'
            }), 404
        
        # 更新数据
        if 'description' in data:
            time_log.description = data['description'].strip() or None
        
        if 'start_time' in data:
            from datetime import datetime
            time_log.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        
        if 'end_time' in data:
            from datetime import datetime
            time_log.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
            time_log.update_duration()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': time_log.to_dict(),
            'message': '时间日志更新成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': '更新时间日志失败',
            'message': str(e)
        }), 500

@timer_bp.route('/time-logs/<int:log_id>', methods=['DELETE'])
def delete_time_log(log_id):
    """删除时间日志"""
    try:
        time_log = TimeLog.query.get(log_id)
        if not time_log:
            return jsonify({
                'success': False,
                'error': '时间日志未找到',
                'message': f'ID为{log_id}的时间日志不存在'
            }), 404
        
        db.session.delete(time_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '时间日志删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': '删除时间日志失败',
            'message': str(e)
        }), 500

@timer_bp.route('/tasks/<int:task_id>/timer/status', methods=['GET'])
def get_timer_status(task_id):
    """获取计时器状态"""
    try:
        # 检查任务是否存在
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': '任务未找到',
                'message': f'ID为{task_id}的任务不存在'
            }), 404
        
        # 检查是否有正在运行的计时器
        running_timer = TimeLog.get_running_timer(task_id)
        
        return jsonify({
            'success': True,
            'data': {
                'is_running': running_timer is not None,
                'current_timer': running_timer.to_dict() if running_timer else None,
                'total_time': TimeLog.get_total_time_by_task(task_id)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': '获取计时器状态失败',
            'message': str(e)
        }), 500