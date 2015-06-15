# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Mensaje',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mensaje', models.CharField(max_length=255)),
                ('leido', models.BooleanField()),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('envia', models.ForeignKey(related_name='enviaUsuarioCmt', to=settings.AUTH_USER_MODEL)),
                ('recibe', models.ForeignKey(related_name='recibeUsuarioCmt', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
