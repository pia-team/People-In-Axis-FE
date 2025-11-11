# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Login
  - generic [ref=e5]:
    - banner [ref=e6]:
      - heading "Sign in to your account" [level=1] [ref=e7]
    - generic [ref=e9]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Username or email
          - textbox "Username or email" [active] [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]: Password
          - textbox "Password" [ref=e18]
        - button "Sign In" [ref=e20] [cursor=pointer]
      - generic [ref=e21]:
        - separator [ref=e22]
        - heading "Or sign in with" [level=4] [ref=e23]
        - list [ref=e24]:
          - link "Google" [ref=e25] [cursor=pointer]:
            - /url: /realms/orbitant-realm/broker/google/login?client_id=orbitant-ui-client&tab_id=zX0bR9TafJ8&session_code=dMjkGBrRRu7JNe3bspsHrnRi5ujqkjG8KHP72M8tZLA
            - generic [ref=e26]: 
            - text: Google
          - link "Connect with Vodafone Account" [ref=e27] [cursor=pointer]:
            - /url: /realms/orbitant-realm/broker/oidc/login?client_id=orbitant-ui-client&tab_id=zX0bR9TafJ8&session_code=dMjkGBrRRu7JNe3bspsHrnRi5ujqkjG8KHP72M8tZLA
```