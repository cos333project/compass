# Temporary helper file to quickly delete Requirements
import django
import os
import sys
from pathlib import Path
from django.db import transaction

sys.path.append(str(Path('../').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from compass.models import Minor

@transaction.atomic
def delete_major(minor_id):
    Minor.objects.filter(id=minor_id).delete()


def main():
    minor_id = input('Enter minor id: ')
    delete_major(minor_id)


if __name__ == '__main__':
    main()
