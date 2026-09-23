# -*- coding: utf-8 -*-

{
    'name': "Barcode",
    'summary': "Use barcode scanners to process logistics operations",
    'description': """
This module enables the barcode scanning feature for the warehouse management system.
    """,
    'category': 'Supply Chain/Inventory',
    'sequence': 255,
    'version': '1.0',
    'depends': ['stock', 'web_tour'],
    'data': [
        'security/ir.model.access.csv',
        'views/stock_inventory_views.xml',
        'views/stock_picking_views.xml',
        'views/stock_picking_type_views.xml',
        'views/stock_move_line_views.xml',
        'views/stock_barcode_views.xml',
        'views/stock_scrap_views.xml',
        'views/stock_location_views.xml',
        'wizard/stock_barcode_cancel_operation.xml',
        'wizard/stock_backorder_confirmation_views.xml',
        'data/data.xml',
    ],
    'demo': [
        'data/demo.xml',
    ],
    'installable': True,
    'auto_install': True,
    'application': True,
    'author': 'Derry.S',
    'license': 'LGPL-3',
    'assets': {
        'web.assets_backend': [
            'wms_barcode/static/src/**/*.js',
            'wms_barcode/static/src/**/*.scss',
            'wms_barcode/static/src/**/*.xml',

            # Don't include dark mode files in light mode
            ('remove', 'wms_barcode/static/src/**/*.dark.scss'),
        ],
        "web.assets_web_dark": [
            'wms_barcode/static/src/**/*.dark.scss',
        ],
        'web.assets_unit_tests': [
            'wms_barcode/static/tests/units/*.test.js',
        ],
        'web.assets_tests': [
            'wms_barcode/static/tests/tours/**/*',
        ],
    }
}
