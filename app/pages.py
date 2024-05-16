import json
import os

from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from werkzeug.utils import secure_filename

from app import recognition as reco
from app import invoice_prep

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


bp = Blueprint("pages", __name__)


@bp.route("/", methods=["GET", "POST"])
def index():
    with open("app/static/templates.json", "r") as file:
        data_json = json.load(file)
    if request.method == "POST":
        if "edit_template" in request.form:
            pass
            template_number = request.form.get("index")
            invoice_name = data_json[int(template_number)]["invoiceName"]
            url = url_for('pages.edit_template', invoice_name=invoice_name, template_number=template_number)
            return redirect(url)
        else:
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
                if "make_new" in request.form:
                    return redirect(url_for('pages.make_template', invoice_name=filename))
                elif "recognize" in request.form:
                    return redirect(url_for('pages.recognition', invoice_name=filename, template_number="none"))
                elif "use" in request.form:
                    return redirect(url_for('pages.recognition', invoice_name=filename, template_number=request.form.get("use")))
    with open("app/static/config.json", "r") as file:
        config_json = json.load(file)
    return render_template("home_screen.html", templates=data_json, config=config_json)


@bp.route("/make_template/<invoice_name>")
def make_template(invoice_name):
    with open("app/static/config.json", "r") as file:
        config_json = json.load(file)
    data_frame = invoice_prep.get_data_frame_json("app/static/invoices/" + invoice_name)
    return render_template("make_template.html", invoice_name=invoice_name, data_frame=data_frame, data_json=None, template_number='', config=config_json)


@bp.route("/edit_template/<invoice_name>")
def edit_template(invoice_name):
    template_number = request.args.get("template_number")
    with open("app/static/templates.json", "r") as file:
        data_json = json.load(file)
    with open("app/static/config.json", "r") as file:
        config_json = json.load(file)
    data_frame = invoice_prep.get_data_frame_json("app/static/invoices/" + invoice_name)
    return render_template("make_template.html", invoice_name=invoice_name, data_frame=data_frame, data_json=data_json, template_number=template_number, config=config_json)


@bp.route("/recognition/<invoice_name>")
def recognition(invoice_name):
    template_number = request.args.get("template_number")
    if template_number == "none":
        return jsonify("no template selected")
    with open("app/static/templates.json", "r") as file:
        data_json = json.load(file)
    data_frame = reco.data_frame_prep("app/static/invoices/" + invoice_name)
    output = reco.read_with_template(data_json[int(template_number)], data_frame)
    output.update(reco.read_with_template_box_regex(data_json[int(template_number)], data_frame))
    return output
@bp.route("/templates")
def get_templates():
    with open("app/static/templates.json", "r") as file:
        return json.load(file)


@bp.route("/template/save", methods=["POST"])
def save_template():
    data = request.json
    print(data)
    try:
        with open("app/static/templates.json", "r") as file:
            data_json = json.load(file)
    except Exception as e:
        with open("app/static/templates.json", "w") as file:
            file.write("[]")

    result = jsonify(data)
    for x in range(len(data_json)):
        if data["tempName"] == data_json[x]["tempName"]:
            data_json[x] = data
            with open("app/static/templates.json", "w") as file:
                file.write(json.dumps(data_json))
                return result

    with open("app/static/templates.json", "w") as file:
        data_json.append(data)
        file.write(json.dumps(data_json))
    return result


@bp.route("/template/update", methods=["POST"])
def update_template():
    with open("app/static/templates.json", "w") as file:
        file.write(json.dumps(request.json))
    return jsonify("ok")


@bp.route("/config/update", methods=["POST"])
def change_config():
    data = request.json
    with open("app/static/config.json", "w") as file:
        file.write(json.dumps(data))
    return jsonify("ok")
