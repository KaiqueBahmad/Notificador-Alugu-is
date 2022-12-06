from datetime import date
from calendar import monthrange
from acc import my_email, my_pass
import email.message
import smtplib
import requests
import time
import json
token = "Seraphine_boneco_de_pagao456"


def messenger_those(to, names):
    return
    try:
        s = smtplib.SMTP('smtp.gmail.com: 587')
        s.starttls()
        s.login(my_email, my_pass)
        msg = email.message.Message()
        msg['from'] = my_email
        msg['to'] = to  # Cliente
        msg['subject'] = 'Alerta de cobrança '
        msg.add_header('Content-Type', 'text/html')
        rows = ''
        id = 1
        for name in names:
            if id % 2 != 0:
                rows += f"<tr><td style='border: 1px solid #ddd;padding: 8px;'>{name}</td></tr>"
            else:
                rows += f"<tr><td style='border: 1px solid #ddd;padding: 8px;background-color: #f2f2f2'>{name}</td></tr>"
            id += 1
        msg.set_payload(f"""
        <body style='display:flex;justify-content:center;'>
            <table style='font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 40%;'>
                <tr>
                <th style='padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #04aa6d;color: white;border: 1px solid #ddd;padding: 8px;'>Nome</th>
                </tr>
                {rows}
            </table>
        </body>
        """)
        s.sendmail(msg['From'], [msg['To']], msg.as_string().encode('utf-8'))
        print('E-mail enviado com sucesso.')
        s.close()

    except Exception as e:
        print('E-mail não enviado...')
        print('Erro:', e)
        raise e

def count_year(owner, item):
    print('OI', requests.post('http://localhost:3080/update-item', data={'owner':owner, 'id':item}).text)

while True:
    now = date.today()
    today = now.day
    month = now.month
    year = now.year
    month_size = monthrange(now.year, now.month)[1]
    updated_list = json.loads(requests.get(
        'http://localhost:3080/rent-list',
        headers={"token": token}).text)
    for client in updated_list:
        remind_list = []
        for rent in updated_list[client]['inqs']:
            pay_day = updated_list[client]['inqs'][rent]['last-paid'].split('T')[0].split('-')
            if (int(year) == int(pay_day[0])+1) and (int(month)==int(pay_day[1])) and (int(pay_day[2]) == int(today)) or (int(pay_day[2]) < int(month_size) and int(month_size) == int(today)):
                remind_list.append(updated_list[client]['inqs'][rent]['name'])
                count_year(client, updated_list[client]['inqs'][rent]['id'])
        messenger_those(updated_list[client]['notify-channel'], remind_list)
    time.sleep(24*60*60)
