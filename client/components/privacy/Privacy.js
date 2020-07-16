import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/common/Button";
import Router from "next/router";
import Layout from "components/common/Layout";
import styles from "./Privacy.styles.js";

const useStyles = makeStyles(styles);

export default function Privacy(props) {
	const classes = useStyles();
	const goBackToHome = () => {
		Router.push("/");
	};

	return (
		<Layout>
			<div class={classes.root}>
				<article>
					<h2 style={{ textAlign: "center" }}>Privacy policy</h2>

					<p>
						This privacy policy (&quot;Policy&quot;) describes how
						Website Operator (&quot;Website Operator&quot;,
						&quot;we&quot;, &quot;us&quot; or &quot;our&quot;)
						collects, protects and uses the personally identifiable
						information (&quot;Personal Information&quot;) you
						(&quot;User&quot;, &quot;you&quot; or &quot;your&quot;)
						may provide on the{" "}
						<a
							target="_blank"
							rel="nofollow"
							href="https://edaviewer.com"
						>
							edaviewer.com
						</a>{" "}
						website and any of its products or services
						(collectively, &quot;Website&quot; or
						&quot;Services&quot;).
					</p>
					<p>
						It also describes the choices available to you regarding
						our use of your Personal Information and how you can
						access and update this information. This Policy does not
						apply to the practices of companies that we do not own
						or control, or to individuals that we do not employ or
						manage.
					</p>
					<h2>Automatic collection of information</h2>
					<p>
						When you visit the Website our servers automatically
						record information that your browser sends. This data
						may include information such as your device's IP
						address, browser type and version, operating system type
						and version, language preferences or the webpage you
						were visiting before you came to our Website, pages of
						our Website that you visit, the time spent on those
						pages, information you search for on our Website, access
						times and dates, and other statistics.
					</p>
					<p>
						Information collected automatically is used only to
						identify potential cases of abuse and establish
						statistical information regarding Website usage. This
						statistical information is not otherwise aggregated in
						such a way that would identify any particular user of
						the system.
					</p>
					<h2>Collection of personal information</h2>
					<p>
						You can visit the Website without telling us who you are
						or revealing any information by which someone could
						identify you as a specific, identifiable individual. If,
						however, you wish to use some of the Website's features,
						you may be asked to provide certain Personal Information
						(for example, your name and e-mail address). We receive
						and store any information you knowingly provide to us
						when you fill any online forms on the Website. You can
						choose not to provide us with your Personal Information,
						but then you may not be able to take advantage of some
						of the Website's features. Users who are uncertain about
						what information is mandatory are welcome to contact us.
					</p>
					<h2>Use and processing of collected information</h2>
					<p>
						In order to make our Website and Services available to
						you, or to meet a legal obligation, we need to collect
						and use certain Personal Information. If you do not
						provide the information that we request, we may not be
						able to provide you with the requested products or
						services. Some of the information we collect is directly
						from you via our Website. However, we may also collect
						Personal Information about you from other sources. Any
						of the information we collect from you may be used for
						the following purposes:
					</p>
					<ul>
						<li>Respond to inquiries and offer support</li>
						<li>Improve user experience</li>
						<li>Protect from abuse and malicious users</li>
						<li>Respond to legal requests and prevent harm</li>
						<li>Run and operate our Website and Services</li>
					</ul>
					<p>
						Processing your Personal Information depends on how you
						interact with our Website, where you are located in the
						world and if one of the following applies: (i) you have
						given your consent for one or more specific purposes;
						this, however, does not apply, whenever the processing
						of Personal Information is subject to California
						Consumer Privacy Act or European data protection law;
						(ii) provision of information is necessary for the
						performance of an agreement with you and/or for any
						pre-contractual obligations thereof; (iii) processing is
						necessary for compliance with a legal obligation to
						which you are subject; (iv) processing is related to a
						task that is carried out in the public interest or in
						the exercise of official authority vested in us; (v)
						processing is necessary for the purposes of the
						legitimate interests pursued by us or by a third party.
					</p>
					<p>
						{" "}
						Note that under some legislations we may be allowed to
						process information until you object to such processing
						(by opting out), without having to rely on consent or
						any other of the following legal bases below. In any
						case, we will be happy to clarify the specific legal
						basis that applies to the processing, and in particular
						whether the provision of Personal Information is a
						statutory or contractual requirement, or a requirement
						necessary to enter into a contract.
					</p>
					<h2>Disclosure of information</h2>
					<p>
						{" "}
						Depending on the requested Services or as necessary to
						complete any transaction or provide any service you have
						requested, we may share your information with your
						consent with our trusted third parties that work with
						us, any other affiliates and subsidiaries we rely upon
						to assist in the operation of the Website and Services
						available to you. We do not share Personal Information
						with unaffiliated third parties. These service providers
						are not authorized to use or disclose your information
						except as necessary to perform services on our behalf or
						comply with legal requirements. We may share your
						Personal Information for these purposes only with third
						parties whose privacy policies are consistent with ours
						or who agree to abide by our policies with respect to
						Personal Information. These third parties are given
						Personal Information they need only in order to perform
						their designated functions, and we do not authorize them
						to use or disclose Personal Information for their own
						marketing or other purposes.
					</p>
					<p>
						We will disclose any Personal Information we collect,
						use or receive if required or permitted by law, such as
						to comply with a subpoena, or similar legal process, and
						when we believe in good faith that disclosure is
						necessary to protect our rights, protect your safety or
						the safety of others, investigate fraud, or respond to a
						government request.
					</p>
					<h2>Retention of information</h2>
					<p>
						We will retain and use your Personal Information for the
						period necessary to comply with our legal obligations,
						resolve disputes, and enforce our agreements unless a
						longer retention period is required or permitted by law.
						We may use any aggregated data derived from or
						incorporating your Personal Information after you update
						or delete it, but not in a manner that would identify
						you personally. Once the retention period expires,
						Personal Information shall be deleted. Therefore, the
						right to access, the right to erasure, the right to
						rectification and the right to data portability cannot
						be enforced after the expiration of the retention
						period.
					</p>
					<h2>Transfer of information</h2>
					<p>
						Depending on your location, data transfers may involve
						transferring and storing your information in a country
						other than your own. You are entitled to learn about the
						legal basis of information transfers to a country
						outside the European Union or to any international
						organization governed by public international law or set
						up by two or more countries, such as the UN, and about
						the security measures taken by us to safeguard your
						information. If any such transfer takes place, you can
						find out more by checking the relevant sections of this
						Privacy Policy or inquire with us using the information
						provided in the contact section.
					</p>
					<h2>The rights of users</h2>
					<p>
						You may exercise certain rights regarding your
						information processed by us. In particular, you have the
						right to do the following: (i) you have the right to
						withdraw consent where you have previously given your
						consent to the processing of your information; (ii) you
						have the right to object to the processing of your
						information if the processing is carried out on a legal
						basis other than consent; (iii) you have the right to
						learn if information is being processed by us, obtain
						disclosure regarding certain aspects of the processing
						and obtain a copy of the information undergoing
						processing; (iv) you have the right to verify the
						accuracy of your information and ask for it to be
						updated or corrected; (v) you have the right, under
						certain circumstances, to restrict the processing of
						your information, in which case, we will not process
						your information for any purpose other than storing it;
						(vi) you have the right, under certain circumstances, to
						obtain the erasure of your Personal Information from us;
						(vii) you have the right to receive your information in
						a structured, commonly used and machine readable format
						and, if technically feasible, to have it transmitted to
						another controller without any hindrance. This provision
						is applicable provided that your information is
						processed by automated means and that the processing is
						based on your consent, on a contract which you are part
						of or on pre-contractual obligations thereof.
					</p>
					<h2>The right to object to processing</h2>
					<p>
						Where Personal Information is processed for the public
						interest, in the exercise of an official authority
						vested in us or for the purposes of the legitimate
						interests pursued by us, you may object to such
						processing by providing a ground related to your
						particular situation to justify the objection.
					</p>
					<h2>Data protection rights under GDPR</h2>
					<p>
						If you are a resident of the European Economic Area
						(EEA), you have certain data protection rights. Website
						Operator aims to take reasonable steps to allow you to
						correct, amend, delete, or limit the use of your
						Personal Information. If you wish to be informed what
						Personal Information we hold about you and if you want
						it to be removed from our systems, please contact us. In
						certain circumstances, you have the following data
						protection rights:
					</p>
					<ul>
						<li>
							You have the right to request access to your
							Personal Information that we store and have the
							ability to access your Personal Information.
						</li>
						<li>
							You have the right to request that we correct any
							Personal Information you believe is inaccurate. You
							also have the right to request us to complete the
							Personal Information you believe is incomplete.
						</li>
						<li>
							You have the right to request the erase your
							Personal Information under certain conditions of
							this Privacy Policy.
						</li>
						<li>
							You have the right to object to our processing of
							your Personal Information.
						</li>
						<li>
							{" "}
							You have the right to seek restrictions on the
							processing of your Personal Information. When you
							restrict the processing of your Personal
							Information, we may store it but will not process it
							further.
						</li>
						<li>
							{" "}
							You have the right to be provided with a copy of the
							information we have on you in a structured,
							machine-readable and commonly used format.
						</li>
						<li>
							{" "}
							You also have the right to withdraw your consent at
							any time where Website Operator relied on your
							consent to process your Personal Information.
						</li>
					</ul>
					<p>
						You have the right to complain to a Data Protection
						Authority about our collection and use of your Personal
						Information. For more information, please contact your
						local data protection authority in the European Economic
						Area (EEA).
					</p>
					<h2>California privacy rights</h2>
					<p>
						In addition to the rights as explained in this Privacy
						Policy, California residents who provide Personal
						Information (as defined in the statute) to obtain
						products or services for personal, family, or household
						use are entitled to request and obtain from us, once a
						calendar year, information about the Personal
						Information we shared, if any, with other businesses for
						marketing uses. If applicable, this information would
						include the categories of Personal Information and the
						names and addresses of those businesses with which we
						shared such personal information for the immediately
						prior calendar year (e.g., requests made in the current
						year will receive information about the prior year). To
						obtain this information please contact us.
					</p>
					<h2>How to exercise these rights</h2>
					<p>
						Any requests to exercise your rights can be directed to
						Website Operator through the contact details provided in
						this document. Please note that we may ask you to verify
						your identity before responding to such requests. Your
						request must provide sufficient information that allows
						us to verify that you are the person you are claiming to
						be or that you are the authorized representative of such
						person. You must include sufficient details to allow us
						to properly understand the request and respond to it. We
						cannot respond to your request or provide you with
						Personal Information unless we first verify your
						identity or authority to make such a request and confirm
						that the Personal Information relates to you.
					</p>
					<h2>Privacy of children</h2>
					<p>
						We do not knowingly collect any Personal Information
						from children under the age of 18. If you are under the
						age of 18, please do not submit any Personal Information
						through our Website or Service. We encourage parents and
						legal guardians to monitor their children's Internet
						usage and to help enforce this Policy by instructing
						their children never to provide Personal Information
						through our Website or Service without their permission.
						If you have reason to believe that a child under the age
						of 18 has provided Personal Information to us through
						our Website or Service, please contact us. You must also
						be at least 16 years of age to consent to the processing
						of your Personal Information in your country (in some
						countries we may allow your parent or guardian to do so
						on your behalf).
					</p>
					<h2>Do Not Track signals</h2>
					<p>
						Some browsers incorporate a Do Not Track feature that
						signals to websites you visit that you do not want to
						have your online activity tracked. Tracking is not the
						same as using or collecting information in connection
						with a website. For these purposes, tracking refers to
						collecting personally identifiable information from
						consumers who use or visit a website or online service
						as they move across different websites over time. Our
						Website does not track its visitors over time and across
						third party websites. However, some third party sites
						may keep track of your browsing activities when they
						serve you content, which enables them to tailor what
						they present to you.
					</p>
					<h2>Links to other websites</h2>
					<p>
						Our Website contains links to other websites that are
						not owned or controlled by us. Please be aware that we
						are not responsible for the privacy practices of such
						other websites or third parties. We encourage you to be
						aware when you leave our Website and to read the privacy
						statements of each and every website that may collect
						Personal Information.
					</p>
					<h2>Information security</h2>
					<p>
						We secure information you provide on computer servers in
						a controlled, secure environment, protected from
						unauthorized access, use, or disclosure. We maintain
						reasonable administrative, technical, and physical
						safeguards in an effort to protect against unauthorized
						access, use, modification, and disclosure of Personal
						Information in its control and custody. However, no data
						transmission over the Internet or wireless network can
						be guaranteed. Therefore, while we strive to protect
						your Personal Information, you acknowledge that (i)
						there are security and privacy limitations of the
						Internet which are beyond our control; (ii) the
						security, integrity, and privacy of any and all
						information and data exchanged between you and our
						Website cannot be guaranteed; and (iii) any such
						information and data may be viewed or tampered with in
						transit by a third party, despite best efforts.
					</p>
					<h2>Data breach</h2>
					<p>
						In the event we become aware that the security of the
						Website has been compromised or users Personal
						Information has been disclosed to unrelated third
						parties as a result of external activity, including, but
						not limited to, security attacks or fraud, we reserve
						the right to take reasonably appropriate measures,
						including, but not limited to, investigation and
						reporting, as well as notification to and cooperation
						with law enforcement authorities. In the event of a data
						breach, we will make reasonable efforts to notify
						affected individuals if we believe that there is a
						reasonable risk of harm to the user as a result of the
						breach or if notice is otherwise required by law. When
						we do, we will post a notice on the Website.
					</p>
					<h2>Changes and amendments</h2>
					<p>
						We may update this Privacy Policy from time to time in
						our discretion and will notify you of any material
						changes to the way in which we treat Personal
						Information. When changes are made, we will revise the
						updated date at the bottom of this page. We may also
						provide notice to you in other ways in our discretion,
						such as through contact information you have provided.
						Any updated version of this Privacy Policy will be
						effective immediately upon the posting of the revised
						Privacy Policy unless otherwise specified. Your
						continued use of the Website or Services after the
						effective date of the revised Privacy Policy (or such
						other act specified at that time) will constitute your
						consent to those changes. However, we will not, without
						your consent, use your Personal Information in a manner
						materially different than what was stated at the time
						your Personal Information was collected. Policy was
						created with{" "}
						<a
							style={{ color: "inherit" }}
							target="_blank"
							title="Create privacy policy"
							rel="nofollow"
							href="https://www.websitepolicies.com/blog/sample-privacy-policy-template"
						>
							WebsitePolicies
						</a>
						.
					</p>
					<h2>Acceptance of this policy</h2>
					<p>
						You acknowledge that you have read this Policy and agree
						to all its terms and conditions. By using the Website or
						its Services you agree to be bound by this Policy. If
						you do not agree to abide by the terms of this Policy,
						you are not authorized to use or access the Website and
						its Services.
					</p>
					<h2>Contacting us</h2>
					<p>
						If you would like to contact us to understand more about
						this Policy or wish to contact us concerning any matter
						relating to individual rights and your Personal
						Information, you may do so via the{" "}
						<a
							target="_blank"
							rel="nofollow"
							href="https://github.com/ahmed-agiza/EDAViewer/issues"
						>
							GitHub page.
						</a>
					</p>
					<p>This document was last updated on June 29, 2020</p>
				</article>
				<div class="footer">
					<a
						target="_blank"
						rel="nofollow"
						href="https://edaviewer.com"
					>
						https://edaviewer.com
					</a>
				</div>
				<div style={{ textAlign: "center" }}>
					<Button color="primary" size="lg" onClick={goBackToHome}>
						Go Back to Home
					</Button>
				</div>
			</div>
		</Layout>
	);
}
