import User from "../models/user";
import stripe from "stripe";
import queryString from "query-string";

export const makeInstructor = async (req, res) => {
  try {
    // 1. find user from db
    const user = await User.findById(req.user._id).exec();

    // 2. if user dont have stripe_account_id yet, then create new
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "express" });
      // console.log(`ACCOUNT`, account.id)
      user.stripe_account_id = account.id;
      user.save();
    }
    //   console.log('accountLink :>> ', accountLink);

    // 3. create account link based on account id (for FE to complete onboarding)
    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding"
    });

    // 4. pre-fill any info such as email (optional), then send url response to FE
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email
    });

    // 5. then send the account link as response to FE
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (err) {
    console.log("MAKE INSTRUCTOR ERR", err);
  }
};
