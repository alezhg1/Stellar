from django.core.management.base import BaseCommand
from core.models import Topic


class Command(BaseCommand):
    help = 'Setup demo topics for all subjects'

    def handle(self, *args, **options):
        # Mathematics topics
        math_topics = [
            'Алгебра: линейные уравнения',
            'Алгебра: квадратные уравнения',
            'Алгебра: системы уравнений',
            'Геометрия: треугольники',
            'Геометрия: окружности',
            'Тригонометрия: основные функции',
            'Производная и интеграл',
        ]
        
        # Physics topics
        physics_topics = [
            'Механика: кинематика',
            'Механика: динамика',
            'Механика: законы сохранения',
            'Электричество: закон Ома',
            'Электричество: цепи постоянного тока',
            'Оптика: отражение и преломление',
            'Термодинамика: основы',
        ]
        
        # Russian language topics
        russian_topics = [
            'Орфография: безударные гласные',
            'Орфография: согласные',
            'Пунктуация: простые предложения',
            'Пунктуация: сложные предложения',
            'Грамматика: части речи',
            'Сочинение: структура',
            'Сочинение: аргументация',
        ]
        
        # Informatics topics
        informatics_topics = [
            'Программирование: переменные',
            'Программирование: циклы',
            'Программирование: функции',
            'Алгоритмы: сортировка',
            'Алгоритмы: поиск',
            'Структуры данных: массивы',
            'Структуры данных: списки',
        ]
        
        subjects = [
            ('math', math_topics),
            ('physics', physics_topics),
            ('russian', russian_topics),
            ('informatics', informatics_topics),
        ]
        
        created_count = 0
        for subject, topics in subjects:
            for topic_name in topics:
                topic, created = Topic.objects.get_or_create(
                    name=topic_name,
                    subject=subject
                )
                if created:
                    created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} topics')
        )
