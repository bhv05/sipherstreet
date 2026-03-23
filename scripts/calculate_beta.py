import os
import requests
import yfinance as yf

# Load env variables or use hardcoded from .env.local
API_KEY = "PKKGL6NZKPRD6KGI3YNQSZLVSU"
SECRET_KEY = "3aMfBfnsVG77BSgEVg8JSt2PpjNWZLGvyVXYREQXENEf"
BASE_URL = "https://paper-api.alpaca.markets"

headers = {
    "APCA-API-KEY-ID": API_KEY,
    "APCA-API-SECRET-KEY": SECRET_KEY
}

def get_portfolio_beta():
    # Get account equity
    account = requests.get(f"{BASE_URL}/v2/account", headers=headers).json()
    equity = float(account['equity'])
    
    # Get positions
    positions = requests.get(f"{BASE_URL}/v2/positions", headers=headers).json()
    
    portfolio_beta = 0.0
    print(f"Total Equity: ${equity:,.2f}")
    print("-" * 50)
    print(f"{'Symbol':<10} {'Weight':<10} {'Beta':<10} {'Contribution':<15}")
    print("-" * 50)
    
    for pos in positions:
        symbol = pos['symbol']
        market_value = float(pos['market_value'])
        # If short, market_value is negative in Alpaca
        # Wait, in Alpaca `market_value` is positive for shorts, or negative? 
        # Actually it's often negative, let me check `qty`. 
        qty = float(pos['qty'])
        # Let's ensure market_value has the right sign
        curr_price = float(pos['current_price'])
        signed_market_value = qty * curr_price
        
        weight = signed_market_value / equity
        
        # Get beta from Yahoo Finance
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            beta = info.get('beta', 1.0) # Default to 1.0 if not found
            if beta is None:
                beta = 1.0
        except Exception as e:
            beta = 1.0
            
        contribution = weight * beta
        portfolio_beta += contribution
        
        print(f"{symbol:<10} {weight*100:>8.2f}% {beta:>8.2f} {contribution:>14.4f}")

    print("-" * 50)
    print(f"Portfolio Beta (vs Market): {portfolio_beta:.3f}")

if __name__ == "__main__":
    get_portfolio_beta()
