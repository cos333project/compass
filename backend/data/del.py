# Temporary helper file to quickly delete Requirements
import django
import os
import sys
from pathlib import Path
from django.db import transaction

sys.path.append(str(Path('../').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from compass.models import Major

@transaction.atomic
def delete_major(major_id):
    Major.objects.filter(id=major_id).delete()


def main():
    major_id = input('Enter major id: ')
    delete_major(major_id)


if __name__ == '__main__':
    main()
