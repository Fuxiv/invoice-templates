import os

from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.utils import secure_filename

import app.invoice_prep
from app import invoice_prep

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


bp = Blueprint("pages", __name__)


@bp.route("/make_template", methods=["POST", "GET"])
def upload_image():
    if request.method == "POST":
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join("app/static/invoices/", filename))
            return redirect(url_for('pages.make_template', invoice_name=filename))

    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@bp.route("/make_template/<invoice_name>")
def make_template(invoice_name):
    data_frame = invoice_prep.get_data_frame("app/static/invoices/" + invoice_name)
    return render_template("make_template.html", invoice_name=invoice_name, data_frame=data_frame)
