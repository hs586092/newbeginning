import { test, expect } from '@playwright/test';

test.describe('Sidebar MOCK Buttons Test', () => {
  const baseURL = 'https://www.fortheorlingas.com';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
  });

  test('Left Sidebar Button Functionality', async ({ page }) => {
    console.log('🔍 Testing left sidebar buttons...');

    // 스크린샷에서 확인된 버튼들
    const leftSidebarButtons = [
      { text: '모든 메시지 보기', name: '메시지 보기 버튼' },
      { text: '첫 글 쓰기', name: '첫 글 쓰기 버튼' },
      { text: '메시지 확인', name: '메시지 확인 버튼' },
      { text: '활동 보기', name: '활동 보기 버튼' }
    ];

    for (const buttonInfo of leftSidebarButtons) {
      const button = page.getByRole('button', { name: buttonInfo.text }).or(
        page.locator(`button:has-text("${buttonInfo.text}")`)
      );

      const isVisible = await button.isVisible();

      if (isVisible) {
        const isEnabled = await button.isEnabled();
        console.log(`✅ ${buttonInfo.name}: 표시됨, ${isEnabled ? '활성화' : '비활성화'}`);

        if (isEnabled) {
          console.log(`🔘 ${buttonInfo.name} 클릭 테스트...`);

          const urlBefore = page.url();

          try {
            // 클릭하고 반응 확인
            await button.click({ timeout: 3000 });
            await page.waitForTimeout(2000);

            const urlAfter = page.url();

            if (urlBefore !== urlAfter) {
              console.log(`   └─ ✅ 페이지 이동: ${urlAfter}`);
              await page.goto(baseURL); // 원래 페이지로 복귀
            } else {
              console.log(`   └─ ⚠️ MOCK 버튼 의심: 클릭해도 변화 없음`);
            }

            // 새로운 요소가 나타났는지 확인 (모달, 드롭다운 등)
            const modals = page.locator('[role="dialog"], .modal, .dropdown-menu');
            const modalCount = await modals.count();

            if (modalCount > 0) {
              console.log(`   └─ ℹ️ ${modalCount}개의 모달/드롭다운이 나타남`);
            }

          } catch (error) {
            console.log(`   └─ ❌ 클릭 실패: ${error}`);
          }
        }
      } else {
        console.log(`❌ ${buttonInfo.name}: 표시되지 않음`);
      }
    }
  });

  test('Right Sidebar Social Buttons', async ({ page }) => {
    console.log('🔍 Testing right sidebar social buttons...');

    // 스크린샷에서 확인된 사회적 기능 버튼들
    const socialButtons = [
      { text: '가입하기', name: '그룹 가입 버튼' },
      { text: '팔로우', name: '팔로우 버튼' },
      { text: '친구 추가', name: '친구 추가 버튼' },
      { text: '그룹 참여', name: '그룹 참여 버튼' }
    ];

    for (const buttonInfo of socialButtons) {
      // 여러 선택자로 버튼 찾기
      const button = page.getByRole('button', { name: buttonInfo.text }).or(
        page.locator(`button:has-text("${buttonInfo.text}")`)
      ).or(
        page.locator(`a:has-text("${buttonInfo.text}")`)
      );

      const count = await button.count();

      if (count > 0) {
        console.log(`📊 "${buttonInfo.text}" 버튼 ${count}개 발견`);

        // 각각 테스트
        for (let i = 0; i < Math.min(count, 3); i++) { // 최대 3개까지만
          const specificButton = button.nth(i);
          const isVisible = await specificButton.isVisible();

          if (isVisible) {
            const isEnabled = await specificButton.isEnabled();
            console.log(`✅ ${buttonInfo.name} ${i + 1}: ${isEnabled ? '활성화' : '비활성화'}`);

            if (isEnabled) {
              console.log(`🔘 ${buttonInfo.name} ${i + 1} 클릭 테스트...`);

              const urlBefore = page.url();

              try {
                await specificButton.click({ timeout: 3000 });
                await page.waitForTimeout(1500);

                const urlAfter = page.url();

                if (urlBefore !== urlAfter) {
                  console.log(`   └─ ✅ 페이지 이동: ${urlAfter}`);
                  await page.goto(baseURL);
                } else {
                  // 페이지 내 변화 확인
                  const notifications = page.locator('.toast, .alert, .notification, [role="alert"]');
                  const notificationCount = await notifications.count();

                  if (notificationCount > 0) {
                    const message = await notifications.first().textContent();
                    console.log(`   └─ ℹ️ 알림 메시지: "${message}"`);
                  } else {
                    console.log(`   └─ ⚠️ MOCK 버튼 의심: 반응 없음`);
                  }
                }

              } catch (error) {
                console.log(`   └─ ❌ 클릭 실패: ${error}`);
              }
            }
          }
        }
      } else {
        console.log(`❌ ${buttonInfo.name}: 발견되지 않음`);
      }
    }
  });

  test('Detailed Button Inspection', async ({ page }) => {
    console.log('🔍 상세 버튼 검사...');

    // 모든 버튼의 onclick, href 등 속성 확인
    const allButtons = page.locator('button, a[role="button"], [role="button"]');
    const buttonCount = await allButtons.count();

    console.log(`📊 총 ${buttonCount}개의 인터랙티브 요소 발견`);

    let mockButtons = [];
    let functionalButtons = [];

    for (let i = 0; i < Math.min(buttonCount, 20); i++) { // 상위 20개만 검사
      const button = allButtons.nth(i);

      try {
        const isVisible = await button.isVisible();

        if (isVisible) {
          const text = await button.textContent();
          const onClick = await button.getAttribute('onclick');
          const href = await button.getAttribute('href');
          const type = await button.getAttribute('type');
          const disabled = await button.isDisabled();

          const buttonInfo = {
            index: i + 1,
            text: text?.trim() || '텍스트 없음',
            onClick: onClick || '없음',
            href: href || '없음',
            type: type || '없음',
            disabled: disabled
          };

          // MOCK 버튼 의심 조건들
          const isSuspiciousMock = (
            !onClick &&
            !href &&
            type !== 'submit' &&
            !disabled &&
            text?.trim() !== ''
          );

          if (isSuspiciousMock) {
            mockButtons.push(buttonInfo);
          } else {
            functionalButtons.push(buttonInfo);
          }
        }
      } catch (error) {
        console.log(`⚠️ 버튼 ${i + 1} 검사 실패: ${error}`);
      }
    }

    console.log(`\n🔧 기능적 버튼들 (${functionalButtons.length}개):`);
    functionalButtons.forEach(btn => {
      console.log(`   ✅ "${btn.text}" (onClick: ${btn.onClick}, href: ${btn.href}, type: ${btn.type})`);
    });

    console.log(`\n⚠️ MOCK 의심 버튼들 (${mockButtons.length}개):`);
    mockButtons.forEach(btn => {
      console.log(`   🔴 "${btn.text}" (기능 없음 - onClick/href/type 모두 없음)`);
    });

    // MOCK 버튼들을 실제로 클릭해서 반응 확인
    console.log(`\n🔘 MOCK 의심 버튼들 실제 클릭 테스트:`);

    for (const mockBtn of mockButtons.slice(0, 5)) { // 상위 5개만
      try {
        const button = allButtons.nth(mockBtn.index - 1);

        console.log(`클릭 테스트: "${mockBtn.text}"`);

        const urlBefore = page.url();
        await button.click({ timeout: 2000 });
        await page.waitForTimeout(1000);

        const urlAfter = page.url();

        if (urlBefore === urlAfter) {
          // DOM 변화 확인
          const alerts = page.locator('.toast, .alert, .notification, [role="alert"]');
          const hasAlerts = await alerts.count() > 0;

          if (!hasAlerts) {
            console.log(`   └─ 🔴 확실한 MOCK: "${mockBtn.text}" - 아무 반응 없음`);
          } else {
            console.log(`   └─ ⚠️ 일부 기능 있음: "${mockBtn.text}" - 알림 표시됨`);
          }
        } else {
          console.log(`   └─ ✅ 기능 작동: "${mockBtn.text}" - 페이지 이동됨`);
          await page.goto(baseURL);
        }

      } catch (error) {
        console.log(`   └─ ❌ 테스트 실패: "${mockBtn.text}" - ${error}`);
      }
    }
  });

  test('Authentication Required Features', async ({ page }) => {
    console.log('🔐 인증이 필요한 기능들 테스트...');

    // 인증이 필요할 수 있는 버튼들
    const authRequiredButtons = [
      '메시지 보기',
      '글 쓰기',
      '팔로우',
      '가입하기',
      '친구 추가'
    ];

    for (const buttonText of authRequiredButtons) {
      const button = page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
      const count = await button.count();

      if (count > 0) {
        const firstButton = button.first();
        const isVisible = await firstButton.isVisible();

        if (isVisible) {
          console.log(`🔘 "${buttonText}" 버튼 클릭 (인증 필요 여부 확인)...`);

          const urlBefore = page.url();

          try {
            await firstButton.click();
            await page.waitForTimeout(2000);

            const urlAfter = page.url();

            // 로그인 페이지로 리디렉션되었는지 확인
            if (urlAfter.includes('/login')) {
              console.log(`   └─ ✅ 인증 필요: 로그인 페이지로 리디렉션`);
              await page.goto(baseURL);
            } else if (urlBefore === urlAfter) {
              // 인증 관련 메시지나 모달 확인
              const authMessages = page.locator('text=/로그인.*필요/, text=/회원.*가입/, [role="alert"]');
              const hasAuthMessage = await authMessages.count() > 0;

              if (hasAuthMessage) {
                const message = await authMessages.first().textContent();
                console.log(`   └─ ✅ 인증 필요: "${message}"`);
              } else {
                console.log(`   └─ 🔴 MOCK 확실: 인증 체크도 없고 기능도 없음`);
              }
            } else {
              console.log(`   └─ ⚠️ 예상외 동작: ${urlAfter}`);
              await page.goto(baseURL);
            }

          } catch (error) {
            console.log(`   └─ ❌ 테스트 실패: ${error}`);
          }
        }
      }
    }
  });
});