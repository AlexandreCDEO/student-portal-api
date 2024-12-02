import type { SecuryPolicyType } from '@/enums/security-policy-type.js'

export interface SecuryPoliciesRepository {
  searchSecuryPolicyByType(
    empresaid: number,
    type: SecuryPolicyType
  ): Promise<number | null>
}
