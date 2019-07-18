from exponent_server_sdk import DeviceNotRegisteredError
from exponent_server_sdk import PushClient
from exponent_server_sdk import PushMessage
from exponent_server_sdk import PushResponseError
from exponent_server_sdk import PushServerError
from requests.exceptions import ConnectionError
from requests.exceptions import HTTPError


# Basic arguments. You should extend this function with the push features you
# want to use, or simply pass in a `PushMessage` object.
def send_push_message(token,title,message, extra=None):
    try:
        response = PushClient().publish(
            PushMessage(to=token,
                        title=title,
                        body=message,
                        data=extra,
                        sound="default",
                        badge=1))
    except PushServerError as exc:
        # Encountered some likely formatting/validation error.
        extra_data={
            'token': token,
            'message': message,
            'title':title,
            'extra': extra,
            'errors': exc.errors,
            'response_data': exc.response_data,
        }
        print(extra_data)
        raise
    except (ConnectionError, HTTPError) as exc:
        # Encountered some Connection or HTTP error - retry a few times in
        # case it is transient.
        
        extra_data={'token': token, 'message': message, 'extra': extra}
        print(extra_data)
        raise self.retry(exc=exc)

    try:
        # We got a response back, but we don't know whether it's an error yet.
        # This call raises errors so we can handle them with normal exception
        # flows.
        response.validate_response()
    except DeviceNotRegisteredError:
        # Mark the push token as inactive
        from notifications.models import PushToken
        PushToken.objects.filter(token=token).update(active=False)
    except PushResponseError as exc:
        # Encountered some other per-notification error.
        
        extra_data={
            'token': token,
            'message': message,
            'extra': extra,
            'push_response': exc.push_response._asdict(),
        }
        print(extra_data)
        raise self.retry(exc=exc)

if __name__ == "__main__":
    # execute only if run as a script
    
    send_push_message("ExponentPushToken[CUjaeAFjloerZlALRlZwRd]","PornHub","HOW I GOT INVOLVED WITH THE RUSSIAN MAFIA")        


