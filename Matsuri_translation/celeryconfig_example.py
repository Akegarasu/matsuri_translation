# redis
broker_url = 'redis://localhost:6379/0'
result_backend = 'redis://localhost:6379/0'

self_url = 'http://localhost/'

# �����Լ��٣�ʹ��ǰ����������������

# Celery������·�ɣ�ʹ��celery_run.shʱ��Ҫ���ø�·�����ã���������Ҫ���ø�·������
# task_routes = {'Matsuri_translation.manager.execute_event': 'twitter',
#                 'Matsuri_translation.manager.execute_event_auto': "auto"
#                 }

# �ֶ�����Chromeʱ�������ص�Chrome��Ӧ�ĵ��Զ˿ںţ����鳤��Ӧ��celery_run_twitter.sh�����õ�concurrency�������
# ʹ��������·�ɵ���Ȼϣ��worker����Chrome��None
# chrome_twitter_port=range(9222,9224)

# �ֶ�����Chromeʱ����ȫ�Զ�ģʽ��Chrome��Ӧ�ĵ��Զ˿ںţ����鳤��Ӧ��celery_run_auto.sh�����õ�concurrency�������
# ʹ��������·�ɵ���Ȼϣ��worker����Chrome��None
# chrome_auto_port=range(9224,9226)
