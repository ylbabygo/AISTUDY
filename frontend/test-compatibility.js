/**
 * 浏览器兼容性快速测试脚本
 * 在浏览器控制台中运行此脚本来测试关键功能
 */

console.log('🚀 开始浏览器兼容性测试...\n');

// 测试结果收集
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// 测试函数
function test(name, testFn, isWarning = false) {
  try {
    const result = testFn();
    if (result) {
      testResults.passed++;
      testResults.details.push(`✅ ${name}: 通过`);
      console.log(`✅ ${name}: 通过`);
    } else {
      if (isWarning) {
        testResults.warnings++;
        testResults.details.push(`⚠️ ${name}: 警告 - 功能不支持但不影响核心功能`);
        console.warn(`⚠️ ${name}: 警告 - 功能不支持但不影响核心功能`);
      } else {
        testResults.failed++;
        testResults.details.push(`❌ ${name}: 失败`);
        console.error(`❌ ${name}: 失败`);
      }
    }
  } catch (error) {
    if (isWarning) {
      testResults.warnings++;
      testResults.details.push(`⚠️ ${name}: 警告 - ${error.message}`);
      console.warn(`⚠️ ${name}: 警告 - ${error.message}`);
    } else {
      testResults.failed++;
      testResults.details.push(`❌ ${name}: 失败 - ${error.message}`);
      console.error(`❌ ${name}: 失败 - ${error.message}`);
    }
  }
}

// 核心功能测试
console.log('\n📋 核心功能测试:');

test('ES6 箭头函数', () => {
  try {
    eval('() => {}');
    return true;
  } catch {
    return false;
  }
});

test('Promise 支持', () => {
  return 'Promise' in window;
});

test('Fetch API', () => {
  return 'fetch' in window;
});

test('Local Storage', () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
});

test('Session Storage', () => {
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
});

// CSS 功能测试
console.log('\n🎨 CSS 功能测试:');

test('CSS Grid', () => {
  return 'CSS' in window && 'supports' in CSS && CSS.supports('display', 'grid');
});

test('Flexbox', () => {
  return 'CSS' in window && 'supports' in CSS && CSS.supports('display', 'flex');
});

test('CSS 变量', () => {
  return 'CSS' in window && 'supports' in CSS && CSS.supports('--test', 'value');
});

// 现代 API 测试（警告级别）
console.log('\n🔧 现代 API 测试:');

test('Intersection Observer', () => {
  return 'IntersectionObserver' in window;
}, true);

test('Web Animations API', () => {
  return 'animate' in document.createElement('div');
}, true);

test('ResizeObserver', () => {
  return 'ResizeObserver' in window;
}, true);

test('MutationObserver', () => {
  return 'MutationObserver' in window;
}, true);

// 响应式设计测试
console.log('\n📱 响应式设计测试:');

test('视口元标签', () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  return viewport && viewport.content.includes('width=device-width');
});

test('媒体查询支持', () => {
  return 'matchMedia' in window;
});

test('触摸事件支持', () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}, true);

// 性能测试
console.log('\n⚡ 性能测试:');

test('Performance API', () => {
  return 'performance' in window && 'timing' in performance;
}, true);

test('RequestAnimationFrame', () => {
  return 'requestAnimationFrame' in window;
});

// 浏览器信息
console.log('\n🌐 浏览器信息:');

const ua = navigator.userAgent;
let browserName = 'Unknown';
let browserVersion = 'Unknown';

if (ua.includes('Chrome') && !ua.includes('Edge')) {
  browserName = 'Chrome';
  const match = ua.match(/Chrome\/(\d+)/);
  browserVersion = match ? match[1] : 'Unknown';
} else if (ua.includes('Firefox')) {
  browserName = 'Firefox';
  const match = ua.match(/Firefox\/(\d+)/);
  browserVersion = match ? match[1] : 'Unknown';
} else if (ua.includes('Safari') && !ua.includes('Chrome')) {
  browserName = 'Safari';
  const match = ua.match(/Version\/(\d+)/);
  browserVersion = match ? match[1] : 'Unknown';
} else if (ua.includes('Edge') || ua.includes('Edg/')) {
  browserName = 'Edge';
  const match = ua.match(/Edg?\/(\d+)/);
  browserVersion = match ? match[1] : 'Unknown';
}

console.log(`浏览器: ${browserName} ${browserVersion}`);
console.log(`平台: ${navigator.platform}`);
console.log(`用户代理: ${navigator.userAgent}`);
console.log(`屏幕分辨率: ${screen.width}x${screen.height}`);
console.log(`视口大小: ${window.innerWidth}x${window.innerHeight}`);
console.log(`设备像素比: ${window.devicePixelRatio || 1}`);

// 测试总结
console.log('\n📊 测试总结:');
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`❌ 失败: ${testResults.failed}`);
console.log(`⚠️ 警告: ${testResults.warnings}`);
console.log(`📝 总计: ${testResults.passed + testResults.failed + testResults.warnings}`);

if (testResults.failed === 0) {
  console.log('\n🎉 恭喜！您的浏览器完全兼容此应用程序！');
} else if (testResults.failed <= 2) {
  console.log('\n⚠️ 您的浏览器基本兼容，但可能存在一些功能限制。');
} else {
  console.log('\n❌ 您的浏览器兼容性较差，建议升级到现代浏览器。');
}

// 推荐的浏览器版本
console.log('\n💡 推荐的浏览器版本:');
console.log('• Chrome 90+');
console.log('• Firefox 88+');
console.log('• Safari 14+');
console.log('• Edge 90+');

// 返回测试结果供进一步处理
return testResults;