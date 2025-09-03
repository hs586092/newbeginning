# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - link "🤱 첫돌까지" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8] [cursor=pointer]: 🤱
          - heading "첫돌까지" [level=1] [ref=e9] [cursor=pointer]
        - generic [ref=e10]:
          - button "시스템 설정" [ref=e11]:
            - img [ref=e12]
          - link "로그인" [ref=e14] [cursor=pointer]:
            - /url: /login
            - button "로그인" [ref=e15]
    - main [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e19]:
          - heading "📱 최신 피드" [level=1] [ref=e20]
          - paragraph [ref=e21]: 유용한 정보와 커뮤니티 소식을 만나보세요
        - generic [ref=e24]:
          - generic [ref=e25]: 아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
          - paragraph [ref=e26]: 첫 번째 게시글을 작성해보세요!
  - region "Notifications alt+T"
  - alert [ref=e27]
```