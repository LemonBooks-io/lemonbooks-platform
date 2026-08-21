import axios, {  AxiosRequestConfig } from 'axios';
// import { IInvoice } from '../interfaces/invoice.interface';
import config from 'config';
import TapInvoiceDTO from '../dtos/tapInvoiceDTO';

export default class TapInvoiceCallService {
    private baseUrl =config.get("TAP_BASE_URL");
    

    async createInvoice(invoiceData: TapInvoiceDTO, tapKeys : string = ""): Promise<any> {
        try {
            const  _tapConfig : AxiosRequestConfig = {
                headers: {
                    Authorization: `Bearer ${tapKeys}`,
                    Accept: 'application/json',
                    'content-type': 'application/json',
                  }
            }
            const response  = await axios.post(`${this.baseUrl}/invoices/`, invoiceData, _tapConfig);
            // console.log(response.data);
            return response.data ;
        } catch (error : any) {
            console.log(error.response.data);
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }


    async editInvoice(invoiceId: string, invoiceData: TapInvoiceDTO, tapKeys : string = ""){
        try {
            const _tapConfig: AxiosRequestConfig = {
                headers: {
                    Authorization: `Bearer ${tapKeys}`,
                    Accept: 'application/json',
                    'content-type': 'application/json',
                }
            }
            const response = await axios.put(`${this.baseUrl}/invoices/${invoiceId}`, invoiceData, _tapConfig);
            return response.data;
        } catch (error: any) {
            console.log(error.response.data);
            throw new Error(`Error editing invoice: ${error.message}`);
        }
    }
    // async getInvoice(invoiceId: string): Promise<any> {
    //     try {
    //         const response = await this.axiosInstance.get(`${this.baseUrl}/invoices/${invoiceId}`, this._tapConfig);
    //         return response.data;
    //     } catch (error : any) {
    //         throw new Error(`Error fetching invoice: ${error.message}`);
    //     }
    // }

    // async getInvoiceByInvoiceNumber(invoiceNumber: string): Promise<any> {
    //     try {
    //         const response = await this.axiosInstance.get(`/invoices`, {
    //             params: { invoiceNumber }
    //         });
    //         return response.data;
    //     } catch (error : any) {
    //         throw new Error(`Error fetching invoice by number: ${error.message}`);
    //     }
    // }
}
