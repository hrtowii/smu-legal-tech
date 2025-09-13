export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Transforming Legal Workflows
        </h1>
        <p className="text-xl text-gray-600">
          Why law firms, compliance officers, and courts choose our intelligent
          form processing solution
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            The Challenge
          </h2>
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              Criminal defence aid applications face a fundamental accessibility
              challenge: they must remain available through hardcopy forms to
              ensure non-tech savvy applicants can access legal support. Yet,
              this creates significant workflow inefficiencies for government
              officers processing these applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                What Officers Deal With Daily:
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Informal language responses: "not sure," "don't remember,"
                  "maybe"
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Structural non-compliance: lengthy narratives in single boxes
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Incomplete mandatory fields scattered throughout forms
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Varying handwriting quality requiring interpretation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Manual Processing Burden:
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Decode handwritten text across varying legibility levels
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Hunt for mandatory information in unexpected locations
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Translate informal language into system terminology
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Make judgment calls about ambiguous responses
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Who Benefits
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Law Firms
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Reduce manual data entry time</li>
                <li>• Minimize transcription errors</li>
                <li>• Accelerate case intake process</li>
                <li>• Improve client data accuracy</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                Compliance Officers
              </h3>
              <ul className="space-y-2 text-green-800">
                <li>• Ensure mandatory field completion</li>
                <li>• Standardize data formats</li>
                <li>• Flag uncertain interpretations</li>
                <li>• Maintain audit trails</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">
                Courts
              </h3>
              <ul className="space-y-2 text-purple-800">
                <li>• Streamline case processing</li>
                <li>• Improve data searchability</li>
                <li>• Reduce administrative burden</li>
                <li>• Enable digital case management</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Our Solution
          </h2>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">
              Intelligent OCR + AI Processing
            </h3>
            <p className="text-lg mb-6">
              We don't just recognize text – we understand context, handle
              ambiguity, and ensure compliance.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Smart Recognition:</h4>
                <p className="text-blue-100">
                  Our AI handles messy handwriting, informal language, and
                  non-compliant responses that traditional OCR tools fail on.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Human-in-the-Loop:</h4>
                <p className="text-blue-100">
                  Uncertain interpretations are flagged for human review,
                  ensuring accuracy while maintaining efficiency.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the Public Defender's Office and other legal organizations in
            modernizing form processing while maintaining accessibility for all
            applicants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Try the Demo
            </a>
            <a
              href="mailto:contact@legalformai.com"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
