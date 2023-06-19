from flask import Flask, request, jsonify
from PIL import Image
import io
import boto3
import pandas as pd
from trp import Document
from flask_cors import CORS
from flask_pymongo import PyMongo

app = Flask(__name__)
CORS(app)

app.config['MONGO_URI'] = 'mongodb://localhost:27017/asset_management_db'
mongo = PyMongo(app)

client = boto3.client('textract')


@app.route('/process_image', methods=['POST'])
def process_image():
    # Get the department value from the request
    department = request.form.get('department')

    # Check if the 'image' key exists in the request files
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided.'}), 400

    image_file = request.files['image']

    # Perform image processing or any desired operations based on the department value
    buffered = io.BytesIO(image_file.read())

    response = client.analyze_expense(
        Document={'Bytes': buffered.getvalue()}
    )

    def extract_lineitem(lineitemgroups, client):
        items, price, qty = [], [], []
        t_items, t_price, t_qty = [], [], []
        t_items, t_price, t_qty = None, None, None
        for lines in lineitemgroups:
            for item in lines['LineItems']:
                for line in item['LineItemExpenseFields']:
                    if line.get('Type').get('Text') == 'ITEM':
                        t_items = line.get("ValueDetection").get("Text", "")

                    if line.get('Type').get('Text') == "UNIT_PRICE":
                        t_price = line.get("ValueDetection").get("Text", "")

                    if line.get('Type').get('Text') == "QUANTITY":
                        t_qty = line.get("ValueDetection").get("Text", "")

                if t_items:
                    items.append(t_items)
                else:
                    items.append("")
                if t_price:
                    price.append(t_price)
                else:
                    price.append("")
                if t_qty:
                    qty.append(t_qty)
                else:
                    qty.append("")

                t_items, t_price, t_qty = None, None, None

        df = pd.DataFrame()
        df["items"] = items
        df["unit_price"] = price
        df["quantity"] = qty

        return df

    for i in response['ExpenseDocuments']:
        df = extract_lineitem(i['LineItemGroups'], client)
    df_dict = df.to_dict(orient='records')

    def extract_kv(summaryfields, client):
        field_type, label, value = [], [], []
        for item in summaryfields:
            try:
                field_type.append(item.get("Type").get("Text", ""))
            except:
                field_type.append("")
            try:
                label.append(item.get("LabelDetection", "").get("Text", ""))
            except:
                label.append("")
            try:
                value.append(item.get("ValueDetection", "").get("Text", ""))
            except:
                value.append("")

        df = pd.DataFrame()
        df["Type"] = field_type
        df["Key"] = label
        df["Value"] = value
        df.dropna(inplace=True)

        return df

    for i in response['ExpenseDocuments']:
        df2 = extract_kv(i['SummaryFields'], client)

    dic = {}

    filtered_df = df2[df2['Type'] == 'INVOICE_RECEIPT_DATE']
    invoice_date = filtered_df['Value'].values[0]
    dic["Invoice Receipt Date"] = invoice_date

    filtered_df = df2[df2['Type'] == 'INVOICE_RECEIPT_ID']
    invoice_id = filtered_df['Value'].values[0]
    dic["Invoice Receipt Number"] = invoice_id

    filtered_df = df2[df2['Type'] == 'TOTAL']
    total = filtered_df['Value'].values[0]
    dic["Total"] = total

    vendor_address = df2[df2['Type'] == 'VENDOR_ADDRESS']['Value'].values
    if len(vendor_address) > 0:
        dic["VENDOR ADDRESS"] = vendor_address[0]

    vendor_name = df2[df2['Type'] == 'VENDOR_NAME']['Value'].values
    if len(vendor_name) > 0:
        dic["VENDOR NAME"] = vendor_name[0]

    merged_dict = dic.copy()
    merged_dict['items'] = df_dict
    merged_dict['Department'] = department

    return jsonify(merged_dict)



@app.route('/add_data', methods=['POST'])
def add_data():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided.'}), 400

    collection = mongo.db.invoice_colls
    inserted_data = collection.insert_one(data)

    return jsonify({'message': 'Data added successfully.', 'inserted_id': str(inserted_data.inserted_id)})


@app.route('/invoices', methods=['GET'])
def get_invoices():
    invoices = mongo.db.invoice_colls.find()
    invoices_list = []

    for invoice in invoices:
        invoices_list.append({
            'id': str(invoice['_id']),
            'department': invoice['Department'],
            'invoice_receipt_date': invoice['Invoice Receipt Date'],
            'total': invoice['Total'],
        })

    return jsonify(invoices_list)


@app.route('/invoices/<ObjectId:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    invoice = mongo.db.invoice_colls.find_one_or_404({'_id': invoice_id})
    if invoice:
        invoice['_id'] = str(invoice['_id'])  # Convert ObjectId to string
        return jsonify(invoice)
    else:
        return jsonify({'message': 'Invoice not found'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
