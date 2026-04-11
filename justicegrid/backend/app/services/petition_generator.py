"""
Petition Generator — generates legal petitions as downloadable text.

Three distinct petition types (no overlap):
1. S.479 Bail Petition — for eligible undertrials who haven't filed bail
2. PR Bond Petition — for destitute accused with unexecuted surety (30+ days)
3. S.440 Surety Reduction — when surety > 90 days of MGNREGA wages
"""
from datetime import date
from sqlalchemy.orm import Session
from ..models.schemas import Case, Court, District, Prison


def generate_s479_petition(case: Case, db: Session) -> str:
    """Generate a ready-to-file S.479 BNSS bail petition."""
    today = date.today()
    detention_days = (today - case.arrest_date).days
    effective_days = detention_days - (case.accused_delay_days or 0)

    charges = case.charges or []
    non_life = [c for c in charges if not c.get("life_or_death", False) and c.get("max_years", 0) > 0]
    max_years = max((c.get("max_years", 1) for c in non_life), default=1)
    is_first = case.is_first_offender if case.is_first_offender is not None else True
    fraction = "one-third (1/3)" if is_first else "one-half (1/2)"
    threshold_days = int(max_years * 365 * (1/3 if is_first else 1/2))
    overdue = effective_days - threshold_days

    court = db.query(Court).filter(Court.id == case.court_id).first()
    prison = db.query(Prison).filter(Prison.id == case.prison_id).first()
    district = db.query(District).filter(District.id == case.district_id).first()

    charge_sections = ", ".join(f"S.{c.get('section', '?')} IPC" for c in charges)

    petition = f"""
═══════════════════════════════════════════════════════════════
    IN THE COURT OF {court.court_name.upper() if court else "THE HON'BLE SESSIONS COURT"}
    {district.name.upper() if district else ""}, {district.state.upper() if district else ""}
═══════════════════════════════════════════════════════════════

    BAIL APPLICATION UNDER SECTION 479 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

    Case No.: {case.case_number}
    FIR No.: {case.fir_number or "N/A"}
    Police Station: {case.police_station or "N/A"}

    IN THE MATTER OF:

    {case.accused_name}
    S/o {case.father_name or "N/A"}
    Age: {case.age or "N/A"} years
    Occupation: {case.occupation or "N/A"}
    R/o {case.address or "N/A"}
                                                    ... APPLICANT / ACCUSED

    vs.

    State of {district.state if district else "N/A"}
                                                    ... RESPONDENT / PROSECUTION

═══════════════════════════════════════════════════════════════
    MOST RESPECTFULLY SHOWETH:
═══════════════════════════════════════════════════════════════

1.  That the Applicant is an undertrial prisoner presently
    lodged in {prison.prison_name if prison else "Central Jail"}, having been
    arrested on {case.arrest_date.strftime("%d-%m-%Y")} in connection with
    FIR No. {case.fir_number or "N/A"} registered at {case.police_station or "N/A"}
    for offences under {charge_sections}.

2.  COMPUTATION OF DETENTION PERIOD:
    ┌────────────────────────────────────────────────┐
    │  Date of Arrest:         {case.arrest_date.strftime("%d-%m-%Y"):>17} │
    │  Total Days in Custody:  {detention_days:>17} days │
    │  Accused's Delay:        {case.accused_delay_days or 0:>17} days │
    │  Effective Detention:    {effective_days:>17} days │
    │                                                │
    │  Maximum Sentence:       {max_years:>17} years│
    │  S.479 Fraction:         {fraction:>17} │
    │  Threshold:              {threshold_days:>17} days │
    │  OVERDUE BY:             {max(overdue, 0):>17} days │
    └────────────────────────────────────────────────┘

3.  That as per Section 479 of BNSS, 2023, where an accused
    {"being a first-time offender" if is_first else "not being a first-time offender"}
    has been detained for a period exceeding {fraction} of the
    maximum sentence prescribed for such offence, the accused
    SHALL BE RELEASED ON BAIL.

4.  That the Applicant {"is a first offender with no previous convictions" if is_first else "has been detained beyond one-half of the maximum sentence"}.

5.  That the Applicant has already served {effective_days} days of detention,
    which exceeds {fraction} of {max_years} years ({threshold_days} days)
    by {max(overdue, 0)} days.

6.  That continued detention of the Applicant is in violation of
    the mandatory provisions of Section 479 BNSS and the
    constitutional guarantee under Article 21 of the Constitution
    of India.

    PRAYER:

    In view of the foregoing facts and circumstances, it is most
    respectfully prayed that this Hon'ble Court may be pleased to:

    (a) Release the Applicant on bail on such terms and conditions
        as this Hon'ble Court deems fit and proper;

    (b) Pass any other order as this Hon'ble Court may deem fit
        in the interest of justice.

    Date: {today.strftime("%d-%m-%Y")}
    Place: {district.name if district else ""}

                                    Through Counsel / Paralegal
                                    {case.lawyer_name or "Legal Aid Panel"}


    VERIFICATION:

    I, {case.accused_name}, the Applicant herein, do hereby verify
    that the contents of the above application are true and correct
    to my knowledge and belief.

    Date: {today.strftime("%d-%m-%Y")}

                                    ________________________
                                    (Signature of Applicant)

═══════════════════════════════════════════════════════════════
    Generated by JusticeGrid — AI-Augmented Legal Intelligence
    System Version: 1.0.0 | Confidence: {(case.eligibility_confidence or 0.95)*100:.0f}%
    This is a draft petition. Legal review is mandatory before filing.
═══════════════════════════════════════════════════════════════
"""
    return petition.strip()


def generate_pr_bond_petition(case: Case, db: Session) -> str:
    """Generate a PR Bond (Personal Recognizance) petition for destitute accused."""
    today = date.today()
    court = db.query(Court).filter(Court.id == case.court_id).first()
    district = db.query(District).filter(District.id == case.district_id).first()
    days_since_bail = (today - case.bail_granted_date).days if case.bail_granted_date else 0

    petition = f"""
═══════════════════════════════════════════════════════════════
    IN THE COURT OF {court.court_name.upper() if court else "THE HON'BLE SESSIONS COURT"}
═══════════════════════════════════════════════════════════════

    APPLICATION FOR RELEASE ON PERSONAL RECOGNIZANCE BOND
    (In lieu of surety bond — under inherent powers)

    Case No.: {case.case_number}
    FIR No.: {case.fir_number or "N/A"}

    {case.accused_name} S/o {case.father_name or "N/A"}
    Age: {case.age or "N/A"}, Occupation: {case.occupation or "N/A"}
                                                    ... APPLICANT

    vs. State of {district.state if district else "N/A"} ... RESPONDENT

═══════════════════════════════════════════════════════════════

MOST RESPECTFULLY SHOWETH:

1.  That this Hon'ble Court was pleased to grant bail to the
    Applicant vide order dated {case.bail_granted_date.strftime("%d-%m-%Y") if case.bail_granted_date else "N/A"}
    with a surety of ₹{case.surety_amount:,.0f}.

2.  That despite the lapse of {days_since_bail} days since the
    grant of bail, the Applicant has been UNABLE to furnish the
    required surety amount due to extreme financial hardship.

3.  FINANCIAL PROFILE OF THE APPLICANT:
    ┌──────────────────────────────────────────────┐
    │  Occupation:           {case.occupation or "N/A":>20} │
    │  Education:            {case.education or "N/A":>20} │
    │  Surety Required:     ₹{case.surety_amount:>19,.0f} │
    │  Days Since Bail:      {days_since_bail:>20} │
    │  Bail Status:          {"UNEXECUTED":>20} │
    └──────────────────────────────────────────────┘

4.  That the Applicant belongs to a marginalized economic
    background with occupation listed as "{case.occupation or 'daily wage worker'}"
    and education level "{case.education or 'N/A'}." The surety amount
    of ₹{case.surety_amount:,.0f} is manifestly beyond the means of the
    Applicant and their family.

5.  That continued incarceration despite a bail order solely due to
    inability to furnish surety violates the Applicant's
    fundamental rights under Articles 14 and 21 of the Constitution.

6.  Reliance is placed on: Hussainara Khatoon v. Home Secretary,
    State of Bihar (1980) — "Bail should not become a tool that
    privileges the rich over the poor."

    PRAYER:

    It is prayed that this Hon'ble Court may release the Applicant
    on a Personal Recognizance Bond (PR Bond) without financial
    surety, subject to such conditions as may be deemed appropriate.

    Date: {today.strftime("%d-%m-%Y")}

                                    {case.lawyer_name or "Legal Aid Panel"}

═══════════════════════════════════════════════════════════════
    Generated by JusticeGrid — AI-Augmented Legal Intelligence
    This is a draft. Legal review is mandatory before filing.
═══════════════════════════════════════════════════════════════
"""
    return petition.strip()


def generate_s440_reduction(case: Case, db: Session) -> str:
    """Generate a S.440 CrPC Surety Reduction application."""
    today = date.today()
    court = db.query(Court).filter(Court.id == case.court_id).first()
    district = db.query(District).filter(District.id == case.district_id).first()

    mgnrega_rate = district.mgnrega_rate if district else 300
    median_income = district.median_monthly_income if district else 15000
    surety = case.surety_amount or 0
    wage_days = round(surety / max(mgnrega_rate, 1), 1)
    income_months = round(surety / max(median_income, 1), 1)

    petition = f"""
═══════════════════════════════════════════════════════════════
    IN THE COURT OF {court.court_name.upper() if court else "THE HON'BLE SESSIONS COURT"}
═══════════════════════════════════════════════════════════════

    APPLICATION FOR REDUCTION OF SURETY AMOUNT
    UNDER SECTION 440 Cr.P.C.

    Case No.: {case.case_number}
    FIR No.: {case.fir_number or "N/A"}

    {case.accused_name} S/o {case.father_name or "N/A"}
                                                    ... APPLICANT

═══════════════════════════════════════════════════════════════

MOST RESPECTFULLY SHOWETH:

1.  That this Hon'ble Court granted bail with surety amount of
    ₹{surety:,.0f} vide order dated {case.bail_granted_date.strftime("%d-%m-%Y") if case.bail_granted_date else "N/A"}.

2.  FINANCIAL ANALYSIS (District: {district.name if district else "N/A"}, {district.state if district else ""}):
    ┌──────────────────────────────────────────────────────┐
    │  Current Surety:                    ₹{surety:>14,.0f} │
    │  District Median Monthly Income:    ₹{median_income:>14,.0f} │
    │  District MGNREGA Daily Wage:       ₹{mgnrega_rate:>14,.0f} │
    │                                                      │
    │  Surety = {income_months} months of income                     │
    │  Surety = {wage_days} days of MGNREGA wages                  │
    │                                                      │
    │  ⚠️  SURETY EXCEEDS 90 DAYS OF LOCAL WAGES            │
    └──────────────────────────────────────────────────────┘

3.  That Section 440 Cr.P.C. mandates that the amount of surety
    bond shall be fixed with due regard to the circumstances of
    the case and shall NOT be excessive.

4.  That the current surety of ₹{surety:,.0f} is equivalent to
    {wage_days} days of MGNREGA wages in {district.name if district else "the district"},
    rendering it manifestly excessive for a person of the
    Applicant's economic background ({case.occupation or "daily wage worker"}).

5.  Reliance is placed on Moti Ram v. State of M.P. (1978) 4 SCC 47:
    "To insist on a heavy bail bond is to make a mockery of the
    benign provisions of bail."

    PRAYER:

    It is prayed that the surety amount be reduced to a level
    commensurate with the Applicant's financial capacity,
    suggested amount: ₹{max(5000, surety // 5):,.0f} (approx. 20% of current surety).

    Date: {today.strftime("%d-%m-%Y")}

                                    {case.lawyer_name or "Legal Aid Panel"}

═══════════════════════════════════════════════════════════════
    Generated by JusticeGrid — Financial Justice Module
═══════════════════════════════════════════════════════════════
"""
    return petition.strip()
