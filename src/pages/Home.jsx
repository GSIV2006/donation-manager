import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function getOverview() {
    const campaignResult = await supabase
      .from("campaigns")
      .select("*")
      .order("id");
    const donationResult = await supabase.from("donations").select("*");
    const donorResult = await supabase.from("donors").select("id");
    const problem =
      campaignResult.error || donationResult.error || donorResult.error;
    if (problem)
      setError("Could not load Supabase records: " + problem.message);
    else {
      setCampaigns(campaignResult.data);
      setDonations(donationResult.data);
      setDonorCount(donorResult.data.length);
    }
    setLoading(false);
  }

  useEffect(() => {
    // The state updates happen after the asynchronous Supabase requests finish.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getOverview();
  }, []);

  const completed = donations.filter(
    (donation) => donation.status === "Completed",
  );
  const total = completed.reduce(
    (sum, donation) => sum + Number(donation.amount),
    0,
  );
  const active = campaigns.filter((campaign) => campaign.status === "Active");

  return (
    <main className="home-page page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" /> SMALL ACTS. REAL CHANGE.
          </div>
          <h1>
            A little giving.
            <br />
            <span>A bigger world.</span>
          </h1>
          <p>
            Behind every contribution is a person who cares.
            <br className="desktop-break" /> Bring your donors, campaigns, and
            their impact together.
          </p>
          <div className="hero-actions">
            <Link to="/donate" className="button">
              Record a donation <span>↗</span>
            </Link>
            <Link to="/campaigns" className="button secondary">
              Explore campaigns
            </Link>
          </div>
          <div className="hero-proof">
            <div className="mini-avatars">
              <span>A</span>
              <span>M</span>
              <span>D</span>
            </div>
            <p>
              <strong>{loading ? "…" : donorCount} donors</strong> creating a
              little more possibility.
            </p>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-star star-one">✦</span>
          <span className="orbit-star star-two">✧</span>
          <div className="giving-symbol">↗</div>
          <div className="art-caption">
            <span>THE RIPPLE EFFECT</span>
            <strong>It starts with you.</strong>
          </div>
        </div>
      </section>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      <section className="impact-stats" aria-label="Donation statistics">
        <div>
          <span className="stat-label">TOTAL CONTRIBUTIONS</span>
          <strong>{loading ? "…" : "₹" + total.toLocaleString("en-IN")}</strong>
          <small>{completed.length} completed donations</small>
        </div>
        <div>
          <span className="stat-label">OUR COMMUNITY</span>
          <strong>{loading ? "…" : String(donorCount).padStart(2, "0")}</strong>
          <small>Donors making a difference</small>
        </div>
        <div>
          <span className="stat-label">CAMPAIGNS IN MOTION</span>
          <strong>
            {loading ? "…" : String(active.length).padStart(2, "0")}
          </strong>
          <small>Shared goals. Lasting impact.</small>
        </div>
        <div className="stat-note">
          <span>✳</span>
          <p>
            Every contribution
            <br />
            has a story.
          </p>
        </div>
      </section>
      <section className="home-campaigns">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GOOD THINGS ARE HAPPENING</span>
            <h2>Find a cause. Make a difference.</h2>
          </div>
          <Link to="/campaigns">All campaigns ↗</Link>
        </div>
        <div className="campaign-grid">
          {active.slice(0, 3).map((campaign, index) => {
            const raised = completed
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
                        : "≈"}
                  </span>
                  <span className="card-number">0{index + 1}</span>
                  <span className="art-word">{campaign.category}</span>
                </div>
                <div className="campaign-content">
                  <span className="category-label">{campaign.category}</span>
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
                    <Link to={`/donate?campaign=${campaign.id}`}>
                      Contribute ↗
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!loading && !error && !active.length && (
          <div className="empty-state">
            No active campaigns yet. Add your first one on the Campaigns page.
          </div>
        )}
      </section>
    </main>
  );
}
export default Home;
