from django.contrib import admin
from .models import UploadInvestigation, Activity, ProcessDump, FileDump, ImageSignature
admin.site.register(UploadInvestigation)
admin.site.register(ProcessDump)
admin.site.register(FileDump)
admin.site.register(ImageSignature)
