{
    'name': 'Module Custom Purchase',
    'version': '17.0.1.0.0',
    'category': 'purchase',
    'summary': 'Purchase Custom Module',
    'description': """
        Purchase Custom Module by Auto
    """,
    'website':'',
    'author': 'Autodidak',
    'depends': ['web','base','product'],
    'data': [
        'security/ir.model.access.csv',
        'views/a_purchase_view.xml',
        'views/a_purchase_action.xml',
        'views/a_purchase_menu.xml',
        'report/a_purchase_qweb.xml',

    ],
    'installable': True,
    'application': True,
    'license': 'OEEL-1',

}