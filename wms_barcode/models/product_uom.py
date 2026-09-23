from odoo import models, api


class ProductUom(models.Model):
    _inherit = 'product.uom'
    _barcode_field = 'barcode'

    @api.model
    def _get_fields_wms_barcode(self):
        return [
            'barcode',
            'product_id',
            'uom_id',
        ]

    def _get_wms_barcode_specific_data(self):
        return {
            'product.product': self.product_id.read(self.env['product.product']._get_fields_wms_barcode(), load=False),
            'uom.uom': self.uom_id.read(self.env['uom.uom']._get_fields_wms_barcode(), load=False)
        }
