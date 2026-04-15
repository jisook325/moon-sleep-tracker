/**
 * Moon Sleep Tracker - 데이터 서비스 레이어
 * Supabase와의 통신 및 데이터 가공을 담당합니다.
 */

import { createClient } from '@supabase/supabase-js';

export class SleepService {
    constructor(url, key) {
        if (url && key) {
            this.supabase = createClient(url, key);
        } else {
            this.supabase = null;
        }
    }

    /**
     * 수면 기록 저장
     */
    async saveRecord({ userName, sleepTime, wakeTime, rating, memo }) {
        if (!this.supabase) throw new Error('Supabase 설정이 필요합니다.');

        const durationMs = new Date(wakeTime) - new Date(sleepTime);
        const durationMin = Math.round(durationMs / (1000 * 60));

        const { data, error } = await this.supabase
            .from('sleep_records')
            .insert([{ 
                user_name: userName,
                sleep_time: new Date(sleepTime).toISOString(),
                wake_time: new Date(wakeTime).toISOString(),
                duration_minutes: durationMin,
                rating: rating || 0,
                memo: memo || ""
            }]);

        if (error) throw error;
        return data;
    }

    /**
     * 대시보드 데이터 로드
     */
    async getRecords(userName, limit = 14) {
        if (!this.supabase) return [];

        const { data, error } = await this.supabase
            .from('sleep_records')
            .select('*')
            .eq('user_name', userName)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    /**
     * 연결 테스트용 간단한 삽입
     */
    async testConnection() {
        if (!this.supabase) throw new Error('설정되지 않음');
        const { error } = await this.supabase
            .from('sleep_records')
            .insert([{ user_name: 'System', memo: 'Connection Test' }]);
        
        if (error) throw error;
        return true;
    }
}
