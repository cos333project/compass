import base64


def generate_encoded_token(consumer_key, consumer_secret):
    """
    Generate the encoded token for API authentication using the given consumer key and consumer secret.
    """
    token_string = f'{consumer_key}:{consumer_secret}'
    encoded_token = base64.b64encode(token_string.encode()).decode()
    return encoded_token


if __name__ == '__main__':
    consumer_key = input('Enter your consumer key: ')
    consumer_secret = input('Enter your consumer secret: ')

    encoded_token = generate_encoded_token(consumer_key, consumer_secret)
    print(f'Your encoded token is: {encoded_token}')
