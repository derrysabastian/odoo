/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, useState } from "@odoo/owl";

export class QRScannerGrFgAction extends Component {
    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.state = useState({ actions: [], scan: null, loading: false });

        const focusInput = () => {
            const input = document.querySelector('.o_barcode_input');
            if (input) input.focus();
        };

        onMounted(() => {
            focusInput();
            document.addEventListener('click', focusInput);
            const input = document.querySelector('.o_barcode_input');
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    this.handleScan(e.target.value);
                    e.target.value = '';
                }
            });
        });
    }

    async handleScan(value) {
        const raw = value.trim();
        const [po_number, production_line_code] = raw.split('|');
        if (!po_number || !production_line_code) {
            alert("Format QR tidak valid");
            return;
        }
        try {
            this.state.loading = true;
            const actions = await this.orm.call(
                "production.order.sap", "get_gr_operation_types_from_qr",
                [po_number, production_line_code]
            );
            if (!actions.length) {
                throw new Error("Operation Type GR tidak ditemukan");
            }
            this.state.scan = { po_number, production_line_code };
            this.state.actions = actions;
        } catch (error) {
            alert(error.data?.message || "Gagal memproses QR");
        } finally {
            this.state.loading = false;
        }
    }

    async selectAction(operationTypeId) {
        const { po_number, production_line_code } = this.state.scan;
        try {
            this.state.loading = true;
            const result = await this.orm.call(
                "production.order.sap", "action_picking_po_sap_from_qr",
                [po_number, production_line_code, operationTypeId]
            );
            this.state.actions = [];
            this.state.scan = null;
            this.action.doAction(result);
        } catch (error) {
            alert(error.data?.message || "Gagal memproses GR");
        } finally {
            this.state.loading = false;
        }
    }

    cancelSelection() {
        this.state.actions = [];
        this.state.scan = null;
    }
}
QRScannerGrFgAction.template = "QRScannerGrFgTemplate";
registry.category("actions").add("qr_scanner_gr_fg_action", QRScannerGrFgAction);
