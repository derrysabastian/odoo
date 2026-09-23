/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import BarcodeQuantModel from "@wms_barcode/models/barcode_quant_model";
import { _t } from "@web/core/l10n/translation";

patch(BarcodeQuantModel.prototype, {
    // LineComponent also renders in Count Inventory. Keep same model API as
    // BarcodePickingModel; quant lines have no picking-session package map.
    getScannedPackageQty(line) {
        return line?.packedQuantity || 0;
    },

    async _processPackage(barcodeData) {
        const recPackage = barcodeData && barcodeData.package;
        if (
            recPackage &&
            recPackage.location_id &&
            (!this.lastScanned.sourceLocation || recPackage.location_id !== this.location.id)
        ) {
            const packageLocation = await this._getOrFetchLocation(recPackage.location_id);
            if (packageLocation) {
                this.location = packageLocation;
            }
        }
        const { packageType, packageName } = barcodeData;
        let packageRecord = recPackage;
        this.lastScanned.packageId = false;
        if (!packageRecord && !packageType && !packageName) {
            return;
        }
        const currentLine = this.selectedLine || this.lastScannedLine;
        if (currentLine?.package_id && packageType && !packageRecord && !packageName) {
            await this.orm.write("stock.package", [currentLine.package_id.id], {
                package_type_id: packageType.id,
            });
            barcodeData.stopped = true;
            return;
        }
        if (!packageRecord && currentLine && !currentLine.package_id) {
            const values = {};
            if (packageName) values.name = packageName;
            if (packageType) values.package_type_id = packageType.id;
            const result = await this.orm.call("stock.package", "action_create_from_barcode", [values]);
            this.cache.setCache(result);
            packageRecord = result["stock.package"][0];
        }
        if (!packageRecord || (packageRecord.location_id && packageRecord.location_id !== this.location.id)) {
            return;
        }
        const result = await this.orm.call("stock.quant", "get_wms_barcode_data_records", [
            packageRecord.contained_quant_ids,
        ]);
        const quants = result.records["stock.quant"];
        this.cache.setCache(result.records);
        if (!quants.length) return;
        for (const quant of quants) {
            const product = this.cache.getRecord("product.product", quant.product_id);
            const lot = quant.lot_id && this.cache.getRecord("stock.lot", quant.lot_id);
            const quantPackage = this.cache.getRecord("stock.package", quant.package_id);
            const line = this._findLine({ ...barcodeData, product, lot, quantPackage });
            const fieldsParams = this._convertDataToFieldsParams({
                product: line ? undefined : product,
                quantity: quant.quantity,
                lot: quant.lot_id,
                package: quant.package_id,
                owner: quant.owner_id,
            });
            if (line) {
                await this.updateLine(line, fieldsParams);
            } else {
                const newLine = await this._createNewLine({ fieldsParams });
                newLine.inventory_quantity = quant.quantity;
            }
        }
        barcodeData.stopped = true;
        this.selectedLineVirtualId = false;
        this.lastScanned.packageId = packageRecord.id;
        this.trigger("update");
    },

    async _getOrFetchLocation(locationId) {
        let location = this.cache.getRecord("stock.location", locationId, false);
        if (location) {
            return location;
        }
        const records = await this.orm.read("stock.location", [locationId], [
            "barcode",
            "display_name",
            "name",
            "parent_path",
            "usage",
        ]);
        if (records && records.length) {
            this.cache.setCache({ "stock.location": records });
            location = this.cache.getRecord("stock.location", locationId, false);
        }
        return location;
    },

    _convertDataToFieldsParams(args) {
        const params = super._convertDataToFieldsParams(...arguments);
        args.product && args.product.uom_bag_id && (params.uom_bag_id = args.product.uom_bag_id);
        return params;
    },

    async updateLine(line, args) {
        await super.updateLine(...arguments);
        if (args.uom_bag_id && !line.uom_bag_id) {
            line.uom_bag_id =
                typeof args.uom_bag_id === "number"
                    ? this.cache.getRecord("uom.uom", args.uom_bag_id, false)
                    : args.uom_bag_id;
        }
    },

    get barcodeInfo() {
        const info = super.barcodeInfo;
        if (
            info.class === "scan_src" &&
            this.groups.group_stock_multi_locations &&
            !this.lastScanned.sourceLocation
        ) {
            return {
                ...info,
                message: this.groups.group_tracking_lot
                    ? _t("Scan a product, a package or a location")
                    : _t("Scan a product or a location"),
            };
        }
        return info;
    },
});
