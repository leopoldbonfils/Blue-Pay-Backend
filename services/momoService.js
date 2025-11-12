const axios = require('axios');

class MomoService {
  constructor() {
    this.baseURL = process.env.MOMO_API_URL;
    this.subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MOMO_API_USER;
    this.apiKey = process.env.MOMO_API_KEY;
  }

  async createAccessToken() {
    try {
      const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('MOMO token error:', error.response?.data || error.message);
      throw new Error('Failed to get MOMO access token');
    }
  }

  async requestToPay(amount, phone, reference, message = '') {
    try {
      const token = await this.createAccessToken();
      const uuid = require('uuid').v4();

      const response = await axios.post(
        `${this.baseURL}/collection/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: 'RWF',
          externalId: reference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phone.replace('+250', '250')
          },
          payerMessage: message,
          payeeNote: 'BluePay Payment'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': uuid,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        referenceId: uuid,
        status: 'pending'
      };
    } catch (error) {
      console.error('MOMO payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getTransactionStatus(referenceId) {
    try {
      const token = await this.createAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('MOMO status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async transfer(amount, phone, reference, message = '') {
    try {
      const token = await this.createAccessToken();
      const uuid = require('uuid').v4();

      const response = await axios.post(
        `${this.baseURL}/disbursement/v1_0/transfer`,
        {
          amount: amount.toString(),
          currency: 'RWF',
          externalId: reference,
          payee: {
            partyIdType: 'MSISDN',
            partyId: phone.replace('+250', '250')
          },
          payerMessage: message,
          payeeNote: 'BluePay Transfer'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': uuid,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        referenceId: uuid,
        status: 'pending'
      };
    } catch (error) {
      console.error('MOMO transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getAccountBalance() {
    try {
      const token = await this.createAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );

      return {
        success: true,
        balance: response.data.availableBalance,
        currency: response.data.currency
      };
    } catch (error) {
      console.error('MOMO balance error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new MomoService();