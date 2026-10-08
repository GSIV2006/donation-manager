import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";

// Use the local calendar date so a time-zone difference cannot change the day.
function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Donate() {
  const [params] = useSearchParams();
  const [donors, setDonors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    donor_id: "",
    campaign_id: params.get("campaign") || "",
    amount: "",
    payment_method: "UPI",
    donation_date: today(),
    status: "Completed",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    async function getOptions() {
      const people = await supabase
        .from("donors")
        .select("id, name")
        .order("name");
      const causes = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "Active")
        .order("id");
      if (people.error || causes.error)
        setError((people.error || causes.error).message);
      else {
        setDonors(people.data);
        setCampaigns(causes.data);
      }
      setLoading(false);
    }
    getOptions();
  }, []);
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setSavedId(null);
  }
  async function saveDonation(event) {
    event.preventDefault();
    setError("");
    setSavedId(null);
    if (!Number(form.amount) || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (
      !campaigns.some((campaign) => String(campaign.id) === form.campaign_id)
    ) {
      setError("Choose an active campaign.");
      return;
    }
    const date = new FormData(event.currentTarget).get("donation_date");
    if (!date || date > today()) {
      setError("Choose a valid donation date up to today.");
      return;
    }
    setSaving(true);
    const { data, error: saveError } = await supabase
      .from("donations")
      .insert({
        ...form,
        donation_date: date,
        donor_id: Number(form.donor_id),
        campaign_id: Number(form.campaign_id),
        amount: Number(form.amount),
        notes: form.notes.trim(),
      })
      .select()
      .single();
    if (saveError) setError(saveError.message);
    else {
      setSavedId(data.id);
      setForm({ ...form, amount: "", notes: "" });
    }
    setSaving(false);
  }
  const selected = campaigns.find(
    (campaign) => String(campaign.id) === form.campaign_id,
  );
  return (
    <main className="page inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ONE CONTRIBUTION. COUNTLESS POSSIBILITIES.
          </span>
          <h1>
            Make the good <span>go further.</span>
          </h1>
          <p>Record a contribution and keep its story in one place.</p>
        </div>
      </div>
      <div className="donation-layout">
        <form className="data-form donation-form" onSubmit={saveDonation}>
          <div className="form-title">
            <h2>Record a donation</h2>
            <span className="status-badge">↗ Supabase connected</span>
          </div>
          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}
          {savedId && (
            <div className="message success" role="status">
              Donation #{savedId} saved to Supabase.{" "}
              <Link to="/history">View contribution history ↗</Link>
            </div>
          )}
          {loading ? (
            <p>Loading donors and campaigns…</p>
          ) : (
            <>
              <div className="form-grid">
                <label>
                  Donor
                  <select
                    name="donor_id"
                    required
                    value={form.donor_id}
                    onChange={change}
                  >
                    <option value="">Select a donor</option>
                    {donors.map((donor) => (
                      <option key={donor.id} value={donor.id}>
                        {donor.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Campaign
                  <select
                    name="campaign_id"
                    required
                    value={form.campaign_id}
                    onChange={change}
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="form-hint">
                New person?{" "}
                <Link to="/donors">Add them to your donors first ↗</Link>
              </p>
              <label>
                Donation amount (₹)
                <input
                  className="amount-input"
                  type="number"
                  name="amount"
                  min="1"
                  max="999999999"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={form.amount}
                  onChange={change}
                />
              </label>
              <div className="form-grid">
                <label>
                  Payment method
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={change}
                  >
                    {["UPI", "Cash", "Bank transfer", "Card"].map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Donation date
                  <input
                    type="date"
                    name="donation_date"
                    max={today()}
                    required
                    defaultValue={form.donation_date}
                  />
                </label>
              </div>
              <label>
                Payment status
                <select name="status" value={form.status} onChange={change}>
                  <option value="Completed">
                    Completed — payment received
                  </option>
                  <option value="Pending">Pending — awaiting payment</option>
                </select>
              </label>
              <label>
                A little note <span className="optional">(optional)</span>
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={500}
                  placeholder="What made this contribution special?"
                  value={form.notes}
                  onChange={change}
                />
              </label>
              <button
                className="button full-width"
                disabled={saving || !donors.length || !campaigns.length}
              >
                {saving ? "Saving to Supabase…" : "Save donation ↗"}
              </button>
              <p className="form-hint centered">
                This records a donation. No money is charged.
              </p>
            </>
          )}
        </form>
        <aside className="donation-aside">
          <span className="aside-star" aria-hidden="true">
            ✳
          </span>
          <span className="eyebrow">GIVING HAS A RIPPLE EFFECT</span>
          <h2>
            {selected ? selected.title : "It starts with a little kindness."}
          </h2>
          <p>
            {selected
              ? selected.description
              : "A new classroom. A warm meal. A healthier tomorrow. Your contribution becomes part of something bigger."}
          </p>
          <div className="aside-divider" />
          <div className="numbered-note">
            <span>01</span>
            <p>Choose the donor and a cause they care about.</p>
          </div>
          <div className="numbered-note">
            <span>02</span>
            <p>Save their contribution. See its impact in your history.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
export default Donate;
