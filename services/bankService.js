const axios = require('axios');

class BankService {
  constructor() {
    this.baseURL = process.env.BANK_API_URL;
    this.apiKey = process.env.BANK_API_KEY;
  }

  async verifyAccount(bankName, accountNumber) {
    try {
      const response = await axios.post(
        `${this.baseURL}/verify-account`,
        {
          bank: bankName,
          accountNumber: accountNumber
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        accountName: response.data.accountName,
        verified: true
      };
    } catch (error) {
      console.error('Bank verify error:', error.response?.data || error.message);
      return {
        success: false,
        verified: false,
        error: error.response?.data?.message || 'Account verification failed'
      };
    }
  }

  async initiateTransfer(bankName, accountNumber, amount, reference) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transfer`,
        {
          bank: bankName,
          accountNumber: accountNumber,
          amount: amount,
          currency: 'RWF',
          reference: reference,
          description: 'BluePay Transfer'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status
      };
    } catch (error) {
      console.error('Bank transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Transfer failed'
      };
    }
  }

  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('Bank status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Status check failed'
      };
    }
  }

  getBankList() {
    return [
      { code: 'BK', name: 'Bank of Kigali', swiftCode: 'BKIGRWRW' },
      { code: 'Equity', name: 'Equity Bank', swiftCode: 'EQBLRWRW' },
      { code: 'IM', name: 'I&M Bank', swiftCode: 'IMBLRWRW' },
      { code: 'Cogebanque', name: 'Cogebanque', swiftCode: 'COBRRWRW' },
      { code: 'Access', name: 'Access Bank', swiftCode: 'ABNGR WRW' }
    ];
  }
}

module.exports = new BankService();