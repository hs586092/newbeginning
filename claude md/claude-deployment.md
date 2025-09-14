# Deployment Guide - NewBeginning

> 🎯 **배포, 환경변수, CI/CD 파이프라인 가이드**

---

## 📚 목차

1. [배포 전략](#배포-전략)
2. [환경 설정](#환경-설정)
3. [CI/CD 파이프라인](#cicd-파이프라인)
4. [Vercel 배포](#vercel-배포)
5. [환경별 관리](#환경별-관리)
6. [모니터링](#모니터링)
7. [백업 & 복구](#백업--복구)
8. [트러블슈팅](#트러블슈팅)

---

## 🚀 배포 전략

### 환경 구성
```
Production  (main)     ← 실제 서비스
Staging    (develop)   ← 테스트 환경
Development (feature/*) ← 개발 환경
```

### Blue-Green 배포
```yaml
# 무중단 배포를 위한 전략
strategy:
  blue_environment: "현재 운영 중인 환경"
  green_environment: "새 버전이 배포될 환경"
  
workflow:
  1. Green 환경에 새 버전 배포
  2. Health check 및 smoke test 실행
  3. 트래픽을 점진적으로 Green으로 전환
  4. 문제 발생 시 Blue로 즉시 롤백
  5. 성공 시 Blue 환경 정리
```

---

## ⚙️ 환경 설정

### 환경 변수 관리
```bash
# .env.local (개발)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key
ENCRYPTION_KEY=dev-32-character-key-here-123456

# .env.production (프로덕션)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://newbeginning.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
ENCRYPTION_KEY=prod-32-character-key-here-123456

# 추가 환경 변수
NEXTAUTH_SECRET=your-auth-secret
NEXTAUTH_URL=https://your-domain.com
SENTRY_DSN=your-sentry-dsn
VERCEL_ENV=production
```

### 환경별 설정 파일
```typescript
// config/environment.ts
interface EnvironmentConfig {
  app: {
    name: string
    url: string
    version: string
  }
  database: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  features: {
    analytics: boolean
    debugging: boolean
    rateLimiting: boolean
  }
  external: {
    sentryDsn?: string
    gtagId?: string
  }
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    app: {
      name: 'NewBeginning (Dev)',
      url: 'http://localhost:3000',
      version: process.env.npm_package_version || '0.0.0'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    features: {
      analytics: false,
      debugging: true,
      rateLimiting: false
    },
    external: {}
  },
  
  staging: {
    app: {
      name: 'NewBeginning (Staging)',
      url: 'https://newbeginning-staging.vercel.app',
      version: process.env.npm_package_version || '0.0.0'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    features: {
      analytics: false,
      debugging: true,
      rateLimiting: true
    },
    external: {
      sentryDsn: process.env.SENTRY_DSN
    }
  },
  
  production: {
    app: {
      name: 'NewBeginning',
      url: 'https://newbeginning.vercel.app',
      version: process.env.npm_package_version || '0.0.0'
    },
    database: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    features: {
      analytics: true,
      debugging: false,
      rateLimiting: true
    },
    external: {
      sentryDsn: process.env.SENTRY_DSN,
      gtagId: process.env.NEXT_PUBLIC_GTAG_ID
    }
  }
}

export const config = configs[process.env.NODE_ENV || 'development']
```

---

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    name: Test & Quality Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: [test, security]
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "url=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT
      
      - name: Run E2E Tests on Preview
        run: |
          export PLAYWRIGHT_TEST_BASE_URL="${{ steps.deploy.outputs.url }}"
          npx playwright test

  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [test, security]
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
          echo "url=$(cat deployment-url.txt)" >> $GITHUB_OUTPUT
      
      - name: Run Smoke Tests
        run: |
          export PLAYWRIGHT_TEST_BASE_URL="${{ steps.deploy.outputs.url }}"
          npx playwright test --grep="smoke"
      
      - name: Notify Deployment Success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: "🚀 Production deployment successful: ${{ steps.deploy.outputs.url }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## ⚡ Vercel 배포

### vercel.json 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/health/index"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### 배포 스크립트
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# 1. 환경 확인
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN is required"
    exit 1
fi

# 2. 의존성 설치
echo "📦 Installing dependencies..."
npm ci

# 3. 테스트 실행
echo "🧪 Running tests..."
npm run test
npm run lint
npm run type-check

# 4. 빌드
echo "🔨 Building application..."
npm run build

# 5. Vercel 배포
echo "🌐 Deploying to Vercel..."
if [ "$1" == "production" ]; then
    vercel --prod --token $VERCEL_TOKEN
else
    vercel --token $VERCEL_TOKEN
fi

echo "✅ Deployment completed!"
```

---

## 🌍 환경별 관리

### 환경별 데이터베이스 설정
```sql
-- 개발 환경 설정
-- 개발용 RLS 정책 (더 관대함)
CREATE POLICY "개발용_프로필_읽기" ON profiles 
  FOR SELECT USING (true);

-- 스테이징 환경 설정  
-- 실제 정책과 동일하지만 테스트 데이터 사용
CREATE POLICY "스테이징_프로필_읽기" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 프로덕션 환경 설정
-- 엄격한 보안 정책
CREATE POLICY "프로덕션_프로필_읽기" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    (privacy_settings->>'allow_public_view')::boolean = true
  );
```

### 환경별 기능 토글
```typescript
// lib/feature-flags.ts
export const featureFlags = {
  development: {
    debugMode: true,
    artificialDelay: true,
    showDevTools: true,
    allowTestUsers: true,
    skipEmailVerification: true
  },
  
  staging: {
    debugMode: true,
    artificialDelay: false,
    showDevTools: true,
    allowTestUsers: true,
    skipEmailVerification: false
  },
  
  production: {
    debugMode: false,
    artificialDelay: false,
    showDevTools: false,
    allowTestUsers: false,
    skipEmailVerification: false
  }
}

export function getFeatureFlag<K extends keyof typeof featureFlags.development>(
  flag: K
): boolean {
  const env = process.env.NODE_ENV || 'development'
  return featureFlags[env as keyof typeof featureFlags][flag]
}
```

---

## 📊 모니터링

### 헬스 체크 API
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV,
    checks: {
      database: false,
      external_services: false
    }
  }

  try {
    // 데이터베이스 연결 확인
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    
    checks.checks.database = !dbError

    // 외부 서비스 확인 (예: 파일 업로드)
    const { error: storageError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 })
    
    checks.checks.external_services = !storageError

    // 전체 상태 결정
    const allHealthy = Object.values(checks.checks).every(Boolean)
    checks.status = allHealthy ? 'healthy' : 'degraded'

    return NextResponse.json(checks, {
      status: allHealthy ? 200 : 503
    })

  } catch (error) {
    return NextResponse.json({
      ...checks,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
```

### 성능 모니터링
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  static measureApiResponse(handler: Function) {
    return async (request: Request, ...args: any[]) => {
      const startTime = performance.now()
      const startMemory = process.memoryUsage()
      
      try {
        const response = await handler(request, ...args)
        const endTime = performance.now()
        const endMemory = process.memoryUsage()
        
        // 성능 메트릭 수집
        const metrics = {
          duration: endTime - startTime,
          memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
          endpoint: new URL(request.url).pathname,
          method: request.method,
          status: response.status,
          timestamp: new Date().toISOString()
        }
        
        // 느린 응답 로깅
        if (metrics.duration > 1000) {
          console.warn('Slow API response:', metrics)
        }
        
        // 메모리 누수 감지
        if (metrics.memoryDelta > 50 * 1024 * 1024) { // 50MB
          console.warn('High memory usage:', metrics)
        }
        
        return response
      } catch (error) {
        const endTime = performance.now()
        
        console.error('API error:', {
          duration: endTime - startTime,
          endpoint: new URL(request.url).pathname,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        throw error
      }
    }
  }
}
```

---

## 💾 백업 & 복구

### 자동 백업 스크립트
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/newbeginning"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🗄️ Starting backup process..."

# 1. 데이터베이스 백업
echo "📊 Backing up database..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"

# 2. 환경 변수 백업 (민감한 정보 제외)
echo "⚙️ Backing up configuration..."
cat > "$BACKUP_DIR/env_template_$DATE.txt" << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://newbeginning.vercel.app
NEXT_PUBLIC_SUPABASE_URL=[REDACTED]
# 실제 키값은 별도 보안 저장소에 보관
EOF

# 3. 정적 파일 백업 (업로드된 이미지 등)
echo "📸 Backing up static files..."
aws s3 sync s3://newbeginning-storage "$BACKUP_DIR/static_$DATE/" --quiet

# 4. 오래된 백업 정리 (30일 이상)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup completed: $DATE"
```

### 복구 프로세스
```bash
#!/bin/bash
# scripts/restore.sh

if [ $# -ne 2 ]; then
    echo "사용법: $0 <backup-date> <environment>"
    echo "예시: $0 2025-09-13_10-30-00 staging"
    exit 1
fi

BACKUP_DATE=$1
ENVIRONMENT=$2
BACKUP_DIR="/backups/newbeginning"

echo "🔄 Starting restore process for $ENVIRONMENT..."

# 1. 환경 확인
if [ "$ENVIRONMENT" = "production" ]; then
    read -p "⚠️  프로덕션 환경을 복구하시겠습니까? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "복구 작업이 취소되었습니다."
        exit 1
    fi
fi

# 2. 데이터베이스 복구
echo "📊 Restoring database..."
psql $DATABASE_URL < "$BACKUP_DIR/db_$BACKUP_DATE.sql"

# 3. 정적 파일 복구
echo "📸 Restoring static files..."
aws s3 sync "$BACKUP_DIR/static_$BACKUP_DATE/" s3://newbeginning-storage-$ENVIRONMENT --quiet

# 4. 응용프로그램 재배포
echo "🚀 Redeploying application..."
vercel --prod --token $VERCEL_TOKEN

echo "✅ Restore completed for $ENVIRONMENT"
```

---

## 🔧 트러블슈팅

### 일반적인 배포 문제들

#### 1. 빌드 실패
```bash
# 원인: 의존성 충돌
npm ci --legacy-peer-deps

# 원인: 메모리 부족
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 원인: 타입 에러
npm run type-check
```

#### 2. 환경 변수 문제
```bash
# Vercel 환경 변수 확인
vercel env ls

# 로컬에서 환경 변수 테스트
vercel dev --debug
```

#### 3. 데이터베이스 연결 실패
```sql
-- 연결 상태 확인
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

### 롤백 절차
```bash
#!/bin/bash
# scripts/rollback.sh

echo "🔄 Rolling back deployment..."

# 1. 이전 배포 버전 확인
PREVIOUS_DEPLOYMENT=$(vercel ls --token $VERCEL_TOKEN | grep "Ready" | head -2 | tail -1 | awk '{print $1}')

# 2. 이전 버전으로 프로모션
vercel promote $PREVIOUS_DEPLOYMENT --token $VERCEL_TOKEN

# 3. 롤백 확인
vercel ls --token $VERCEL_TOKEN

echo "✅ Rollback completed to: $PREVIOUS_DEPLOYMENT"
```

---

**📝 마지막 업데이트**: 2025-09-13  
**🔄 다음 리뷰 예정**: 2025-10-13  
**📖 관련 문서**: [CLAUDE.md](./CLAUDE.md) | [claude-security.md](./claude-security.md)