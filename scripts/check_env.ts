import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
    console.error('❌ Không tìm thấy file .env.local');
    process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- KẾT QUẢ KIỂM TRA ---');
console.log(`1. URL: ${url ? '✅ Đã có' : '❌ Bị thiếu'}`);
console.log(`2. Service Key: ${key ? '✅ Đã có' : '❌ Bị thiếu'}`);

if (key) {
    console.log(`   Độ dài key: ${key.length} ký tự`);
    if (key.startsWith('eyJ')) {
        console.log('   Định dạng key: ✅ Hợp lệ (JWT)');
    } else {
        console.log('   Định dạng key: ❌ Sai (Không phải JWT)');
    }
    
    // Test kết nối thử
    console.log('\n🔄 Đang thử kết nối tới Supabase...');
    const supabase = createClient(url!, key);
    supabase.auth.admin.listUsers({ perPage: 1 })
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Kết nối thất bại:', error.message);
                console.log('👉 Gợi ý: Key này có thể bị sai hoặc Project bị Pause.');
            } else {
                console.log('✅ Kết nối THÀNH CÔNG! Admin Key hoạt động tốt.');
            }
        });
} else {
    console.log('\n👉 Anh cần lấy Service Role Key từ Supabase Dashboard:');
    console.log('   Settings -> API -> service_role secret');
}
