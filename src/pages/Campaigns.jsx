import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

const emptyForm = {
  title: "",
  description: "",
  category: "Education",
  target_amount: "",
  end_date: "",
  status: "Active",
};

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function getCampaigns() {
    const campaignResult = await supabase
      .from("campaigns")
      .select("*")
      .order("id");
    const donationResult = await supabase
      .from("donations")
      .select("campaign_id, amount")
      .eq("status", "Completed");
    if (campaignResult.error || donationResult.error)
      setError((campaignResult.error || donationResult.error).message);
    else {
      setCampaigns(campaignResult.data);
      setDonations(donationResult.data);
    }
    setLoading(false);
  }
  useEffect(() => {
    // The state updates happen after the asynchronous Supabase requests finish.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCampaigns();
  }, []);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  function edit(campaign) {
    setEditingId(campaign.id);
    setForm({
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      target_amount: campaign.target_amount,
      end_date: campaign.end_date,
      status: campaign.status,
    });
    setShowForm(true);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function saveCampaign(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      setError("Please enter a campaign name and description.");
      return;
    }
    const endDate = new FormData(event.currentTarget).get("end_date");
    if (!endDate || Number(form.target_amount) <= 0) {
      setError("Enter a goal greater than zero and choose an end date.");
      return;
    }
    setSaving(true);
    const values = {
      ...form,
      end_date: endDate,
      title: form.title.trim(),
      description: form.description.trim(),
      target_amount: Number(form.target_amount),
    };
    const result = editingId
      ? await supabase
          .from("campaigns")
          .update(values)
          .eq("id", editingId)
          .select()
          .single()
      : await supabase.from("campaigns").insert(values).select().single();
    if (result.error) setError(result.error.message);
    else {
      setMessage("Campaign saved to Supabase.");
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await getCampaigns();
    }
    setSaving(false);
  }
  const filtered = campaigns.filter((campaign) =>
    (campaign.title + campaign.category)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <main className="page inner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PURPOSE, MEET POSSIBILITY</span>
          <h1>
            Causes worth <span>caring about.</span>
          </h1>
          <p>Choose a campaign. Help move it forward.</p>
        </div>
        <button
          className="button"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
            setError("");
          }}
        >
          ＋ New campaign
        </button>
      </div>
      {message && (
        <p className="message success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {showForm && (
        <form className="data-form campaign-form" onSubmit={saveCampaign}>
          <h2>{editingId ? "Edit campaign" : "Create a campaign"}</h2>
          <div className="form-grid">
            <label>
              Campaign name
              <input
                name="title"
                required
                maxLength={100}
                value={form.title}
                onChange={change}
                placeholder="Give your cause a name"
              />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={change}>
                {[
                  "Education",
                  "Food & nutrition",
                  "Community",
                  "Healthcare",
                  "Environment",
                ].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              required
              maxLength={1000}
              rows={3}
              value={form.description}
              onChange={change}
              placeholder="What will your campaign make possible?"
            />
          </label>
          <div className="form-grid three">
            <label>
              Goal (₹)
              <input
                type="number"
                name="target_amount"
                min="1"
                max="999999999"
                step="0.01"
                required
                value={form.target_amount}
                onChange={change}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                name="end_date"
                required
                key={editingId || "new"}
                defaultValue={form.end_date}
              />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={change}>
                <option>Active</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              disabled={saving}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="button" disabled={saving}>
              {saving ? "Saving…" : "Save campaign"}
            </button>
          </div>
        </form>
      )}
      <div className="list-toolbar">
        <span>{campaigns.length} campaigns · live from Supabase</span>
        <input
          className="search-input"
          aria-label="Search campaigns"
          placeholder="Search campaigns…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {loading ? (
        <div className="empty-state">Loading campaigns…</div>
      ) : (
        <div className="campaign-grid">
          {filtered.map((campaign, index) => {
            const raised = donations
              .filter((donation) => donation.campaign_id === campaign.id)
              .reduce((sum, donation) => sum + Number(donation.amount), 0);
            const percent = Math.round(
              (raised / Number(campaign.target_amount)) * 100,
            );
            return (
              <article
                className={`campaign-card color-${index % 3}`}
                key={campaign.id}
              >
                <div className="campaign-art">
                  <span className="campaign-symbol">
                    {campaign.category === "Education"
                      ? "Aa"
                      : campaign.category === "Food & nutrition"
                        ? "◒"
                        : campaign.category === "Healthcare"
                          ? "+"
                          : "≈"}
                  </span>
                  <span className="card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="art-word">{campaign.category}</span>
                </div>
                <div className="campaign-content">
                  <div className="card-meta">
                    <span className="category-label">{campaign.category}</span>
                    <span className="status-badge">{campaign.status}</span>
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div className="funding">
                    <strong>₹{raised.toLocaleString("en-IN")}</strong>
                    <span>
                      of ₹
                      {Number(campaign.target_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="progress">
                    <span style={{ width: Math.min(100, percent) + "%" }} />
                  </div>
                  <div className="card-bottom">
                    <span>{percent}% funded</span>
                    <button onClick={() => edit(campaign)}>Edit</button>
                    {campaign.status === "Active" && (
                      <Link to={`/donate?campaign=${campaign.id}`}>
                        Contribute ↗
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!loading && !filtered.length && (
        <div className="empty-state">No campaigns found.</div>
      )}
    </main>
  );
}
export default Campaigns;
