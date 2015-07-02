from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import patterns

urlpatterns = [
    # Examples:
    url(r'^$', 'app.views.index', name='index'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login',{'template_name': 'admin/login.html'}),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout'),

    url(r'^node_api$', 'app.views.node_api', name='node_api'),
    url(r'^chat$', 'app.views.chat', name='chat'),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)



if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
    )