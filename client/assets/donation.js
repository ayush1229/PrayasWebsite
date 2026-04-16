(function () {
  const DEFAULT_API_BASE_URL = "http://localhost:5000/api";
  const DONATION_SCRIPT_ID = "prayas-razorpay-checkout";
  const MODAL_ID = "prayas-donation-modal";
  const STYLE_ID = "prayas-donation-style";

  function getApiBaseUrl() {
    return window.API_BASE_URL || DEFAULT_API_BASE_URL;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .prayas-donation-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(16, 24, 18, 0.58);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 1000;
      }
      .prayas-donation-backdrop.is-open {
        display: flex;
      }
      .prayas-donation-modal {
        width: min(100%, 440px);
        background: #ffffff;
        border-radius: 22px;
        padding: 28px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
      }
      .prayas-donation-modal h3 {
        margin: 0 0 8px;
        font-family: 'Playfair Display', serif;
        font-size: 28px;
      }
      .prayas-donation-modal p {
        margin: 0 0 18px;
        color: #5c5c5c;
        line-height: 1.6;
        font-size: 14px;
      }
      .prayas-donation-grid {
        display: grid;
        gap: 12px;
      }
      .prayas-donation-grid input,
      .prayas-donation-grid textarea {
        width: 100%;
        border: 1px solid #d6dfcf;
        border-radius: 14px;
        padding: 14px 16px;
        font: inherit;
        outline: none;
      }
      .prayas-donation-grid input:focus,
      .prayas-donation-grid textarea:focus {
        border-color: #5a9e3a;
        box-shadow: 0 0 0 3px rgba(90, 158, 58, 0.12);
      }
      .prayas-donation-grid textarea {
        resize: vertical;
        min-height: 92px;
      }
      .prayas-donation-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      .prayas-donation-actions button {
        flex: 1;
        border: 0;
        border-radius: 999px;
        padding: 13px 18px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }
      .prayas-donation-actions .secondary {
        background: #edf4e8;
        color: #31571f;
      }
      .prayas-donation-actions .primary {
        background: #5a9e3a;
        color: #ffffff;
      }
      .prayas-donation-actions button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .prayas-donation-status {
        display: none;
        margin-top: 14px;
        font-size: 13px;
        line-height: 1.5;
      }
      .prayas-donation-status.is-visible {
        display: block;
      }
      .prayas-donation-status.is-error {
        color: #c0392b;
      }
      .prayas-donation-status.is-success {
        color: #2f7d32;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal() {
    const existingModal = document.getElementById(MODAL_ID);
    if (existingModal) return existingModal;

    ensureStyles();

    const backdrop = document.createElement("div");
    backdrop.id = MODAL_ID;
    backdrop.className = "prayas-donation-backdrop";
    backdrop.innerHTML = `
      <div class="prayas-donation-modal" role="dialog" aria-modal="true" aria-labelledby="prayas-donation-title">
        <h3 id="prayas-donation-title">Support Prayas</h3>
        <p id="prayas-donation-copy">Your donation helps us continue education and outreach work.</p>
        <form id="prayas-donation-form" class="prayas-donation-grid">
          <input type="text" name="donorName" placeholder="Your name" maxlength="120" />
          <input type="email" name="email" placeholder="Email address" maxlength="120" />
          <input type="tel" name="contact" placeholder="Phone number" maxlength="20" />
          <input type="number" name="amount" placeholder="Amount in INR" min="1" step="1" required />
          <textarea name="message" placeholder="Message (optional)" maxlength="500"></textarea>
          <div class="prayas-donation-actions">
            <button type="button" class="secondary" data-donation-close>Cancel</button>
            <button type="submit" class="primary">Proceed to Pay</button>
          </div>
          <div class="prayas-donation-status" id="prayas-donation-status" aria-live="polite"></div>
        </form>
      </div>
    `;

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    document.body.appendChild(backdrop);
    backdrop.querySelector("[data-donation-close]").addEventListener("click", closeModal);

    const form = backdrop.querySelector("#prayas-donation-form");
    form.addEventListener("submit", submitDonationForm);

    return backdrop;
  }

  function openModal() {
    ensureModal().classList.add("is-open");
  }

  function closeModal() {
    const modal = ensureModal();
    modal.classList.remove("is-open");
  }

  function setStatus(message, kind) {
    const status = ensureModal().querySelector("#prayas-donation-status");
    status.textContent = message;
    status.className = `prayas-donation-status is-visible ${kind ? `is-${kind}` : ""}`.trim();
  }

  function setSubmitting(isSubmitting) {
    const submitButton = ensureModal().querySelector('button[type="submit"]');
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Preparing payment..." : "Proceed to Pay";
  }

  function loadRazorpayScript() {
    const existingScript = document.getElementById(DONATION_SCRIPT_ID);
    if (existingScript) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = DONATION_SCRIPT_ID;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Razorpay Checkout."));
      document.head.appendChild(script);
    });
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "Request failed.");
    }

    return payload;
  }

  async function submitDonationForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get("amount"));

    if (!Number.isFinite(amount) || amount <= 0) {
      setStatus("Enter a valid donation amount.", "error");
      return;
    }

    setSubmitting(true);
    setStatus("", "");

    try {
      await loadRazorpayScript();

      const apiBaseUrl = getApiBaseUrl();
      const [configPayload, orderPayload] = await Promise.all([
        fetchJson(`${apiBaseUrl}/donations/config`),
        fetchJson(`${apiBaseUrl}/donations/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donorName: formData.get("donorName"),
            email: formData.get("email"),
            contact: formData.get("contact"),
            amount,
            message: formData.get("message"),
          }),
        }),
      ]);

      const config = configPayload.data || {};
      const orderData = orderPayload.data || {};
      if (!config.enabled || !orderData.key) {
        throw new Error("Donations are not configured yet. Add the Razorpay key first.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name || config.name,
        description: orderData.description || config.description,
        image: orderData.image || config.image || undefined,
        order_id: orderData.orderId,
        prefill: orderData.prefill || {},
        notes: {
          donationId: orderData.donationId,
        },
        theme: {
          color: "#5a9e3a",
        },
        modal: {
          ondismiss: async function () {
            setSubmitting(false);
            await markFailure(orderData.orderId, "Checkout closed before payment completion.");
            setStatus("Payment window closed. You can try again when ready.", "error");
          },
        },
        handler: async function (response) {
          try {
            const verifyPayload = await fetchJson(`${apiBaseUrl}/donations/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            setSubmitting(false);
            setStatus(
              verifyPayload.message || "Donation received successfully. Thank you.",
              "success",
            );
            form.reset();
            setTimeout(closeModal, 1400);
          } catch (error) {
            setSubmitting(false);
            setStatus(error.message, "error");
          }
        },
      });

      razorpay.on("payment.failed", async function (response) {
        setSubmitting(false);
        const description =
          response.error && response.error.description
            ? response.error.description
            : "Payment failed.";
        await markFailure(orderData.orderId, description);
        setStatus(description, "error");
      });

      razorpay.open();
    } catch (error) {
      setSubmitting(false);
      setStatus(error.message || "Unable to start the payment flow.", "error");
    }
  }

  async function markFailure(orderId, failureReason) {
    if (!orderId) return;

    try {
      await fetchJson(`${getApiBaseUrl()}/donations/failure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, failureReason }),
      });
    } catch (error) {
      console.error("Failed to record donation failure:", error);
    }
  }

  async function applyDonationCopy() {
    try {
      const payload = await fetchJson(`${getApiBaseUrl()}/donations/config`);
      const copy = payload.donationMessage || "Your donation helps us continue education and outreach work.";
      ensureModal().querySelector("#prayas-donation-copy").textContent = copy;
    } catch (error) {
      console.error("Failed to load donation config:", error);
    }
  }

  function bindDonateButtons() {
    document.querySelectorAll(".btn-donate").forEach((button) => {
      button.addEventListener("click", openModal);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureModal();
    bindDonateButtons();
    applyDonationCopy();
  });
})();
