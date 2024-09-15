import { ImageResponse } from "next/og";
import { z } from "zod";

const NGLShareSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  message: z.string().default("Hello, world!"),
  answer: z.string().default("Yes"),
  code_name: z.string().nullish(),
});

export const runtime = "edge";

function getColors(theme: z.infer<typeof NGLShareSchema>["theme"]) {
  return theme === "light"
    ? {
        bgPrimary: "#26C45D",
        bgSecondary: "#9DD45A",
        primary: "#23C45E",
        secondary: "#72C20F",
      }
    : {
        bgPrimary: "#1A8942",
        bgSecondary: "#073116",
        primary: "#1CA34D",
        secondary: "#0B5326",
      };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = NGLShareSchema.parse(Object.fromEntries(searchParams.entries()));

  const [openSansRegular, openSansBold, openSansSemiBold] = await Promise.all([
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-Regular.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-Bold.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-SemiBold.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.8rem",
          backgroundImage: `linear-gradient(to bottom right, ${getColors(data.theme).bgPrimary}, ${getColors(data.theme).bgSecondary})`,
        }}
      >
        <svg
          width="70"
          height="73"
          viewBox="0 0 70 73"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: "scale(2)" }}
        >
          <path
            d="M21.666 15.9999C21.666 17.768 22.3684 19.4637 23.6186 20.714C24.8689 21.9642 26.5646 22.6666 28.3327 22.6666C30.7963 22.7584 33.1521 23.7007 34.9993 25.3333C36.8466 23.7007 39.2024 22.7584 41.666 22.6666C43.4341 22.6666 45.1298 21.9642 46.3801 20.714C47.6303 19.4637 48.3327 17.768 48.3327 15.9999V9.33325H41.666C39.2024 9.42502 36.8466 10.3673 34.9993 11.9999C33.1521 10.3673 30.7963 9.42502 28.3327 9.33325H21.666V15.9999Z"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M27 14.6665C29 14.6665 31 15.3332 31 17.3332C28.3333 17.3332 27 17.3332 27 14.6665ZM43 14.6665C41 14.6665 39 15.3332 39 17.3332C41.6667 17.3332 43 17.3332 43 14.6665Z"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M28.8977 49H25.4777L19.7577 40.34V49H16.3377V34.96H19.7577L25.4777 43.66V34.96H28.8977V49ZM40.6967 39.4C40.4434 38.9333 40.0767 38.58 39.5967 38.34C39.1301 38.0867 38.5767 37.96 37.9367 37.96C36.8301 37.96 35.9434 38.3267 35.2767 39.06C34.6101 39.78 34.2767 40.7467 34.2767 41.96C34.2767 43.2533 34.6234 44.2667 35.3167 45C36.0234 45.72 36.9901 46.08 38.2167 46.08C39.0567 46.08 39.7634 45.8667 40.3367 45.44C40.9234 45.0133 41.3501 44.4 41.6167 43.6H37.2767V41.08H44.7167V44.26C44.4634 45.1133 44.0301 45.9067 43.4167 46.64C42.8167 47.3733 42.0501 47.9667 41.1167 48.42C40.1834 48.8733 39.1301 49.1 37.9567 49.1C36.5701 49.1 35.3301 48.8 34.2367 48.2C33.1567 47.5867 32.3101 46.74 31.6967 45.66C31.0967 44.58 30.7967 43.3467 30.7967 41.96C30.7967 40.5733 31.0967 39.34 31.6967 38.26C32.3101 37.1667 33.1567 36.32 34.2367 35.72C35.3167 35.1067 36.5501 34.8 37.9367 34.8C39.6167 34.8 41.0301 35.2067 42.1767 36.02C43.3367 36.8333 44.1034 37.96 44.4767 39.4H40.6967ZM50.0311 46.36H54.5111V49H46.6111V34.96H50.0311V46.36Z"
            fill="white"
          />
          <path
            d="M6.56141 67L2.54341 62.548V67H1.26941V57.242H2.54341V61.764L6.57541 57.242H8.18541L3.76141 62.128L8.22741 67H6.56141ZM9.17427 63.136C9.17427 62.352 9.33293 61.666 9.65027 61.078C9.9676 60.4807 10.4016 60.0187 10.9523 59.692C11.5123 59.3653 12.1329 59.202 12.8143 59.202C13.4863 59.202 14.0696 59.3467 14.5643 59.636C15.0589 59.9253 15.4276 60.2893 15.6703 60.728V59.328H16.9583V67H15.6703V65.572C15.4183 66.02 15.0403 66.3933 14.5363 66.692C14.0416 66.9813 13.4629 67.126 12.8003 67.126C12.1189 67.126 11.5029 66.958 10.9523 66.622C10.4016 66.286 9.9676 65.8147 9.65027 65.208C9.33293 64.6013 9.17427 63.9107 9.17427 63.136ZM15.6703 63.15C15.6703 62.5713 15.5536 62.0673 15.3203 61.638C15.0869 61.2087 14.7696 60.882 14.3683 60.658C13.9763 60.4247 13.5423 60.308 13.0663 60.308C12.5903 60.308 12.1563 60.42 11.7643 60.644C11.3723 60.868 11.0596 61.1947 10.8263 61.624C10.5929 62.0533 10.4763 62.5573 10.4763 63.136C10.4763 63.724 10.5929 64.2373 10.8263 64.676C11.0596 65.1053 11.3723 65.4367 11.7643 65.67C12.1563 65.894 12.5903 66.006 13.0663 66.006C13.5423 66.006 13.9763 65.894 14.3683 65.67C14.7696 65.4367 15.0869 65.1053 15.3203 64.676C15.5536 64.2373 15.6703 63.7287 15.6703 63.15ZM20.3852 60.756C20.6465 60.2987 21.0292 59.9253 21.5332 59.636C22.0372 59.3467 22.6112 59.202 23.2552 59.202C23.9459 59.202 24.5665 59.3653 25.1172 59.692C25.6679 60.0187 26.1019 60.4807 26.4192 61.078C26.7365 61.666 26.8952 62.352 26.8952 63.136C26.8952 63.9107 26.7365 64.6013 26.4192 65.208C26.1019 65.8147 25.6632 66.286 25.1032 66.622C24.5525 66.958 23.9365 67.126 23.2552 67.126C22.5925 67.126 22.0092 66.9813 21.5052 66.692C21.0105 66.4027 20.6372 66.034 20.3852 65.586V67H19.1112V56.64H20.3852V60.756ZM25.5932 63.136C25.5932 62.5573 25.4765 62.0533 25.2432 61.624C25.0099 61.1947 24.6925 60.868 24.2912 60.644C23.8992 60.42 23.4652 60.308 22.9892 60.308C22.5225 60.308 22.0885 60.4247 21.6872 60.658C21.2952 60.882 20.9779 61.2133 20.7352 61.652C20.5019 62.0813 20.3852 62.5807 20.3852 63.15C20.3852 63.7287 20.5019 64.2373 20.7352 64.676C20.9779 65.1053 21.2952 65.4367 21.6872 65.67C22.0885 65.894 22.5225 66.006 22.9892 66.006C23.4652 66.006 23.8992 65.894 24.2912 65.67C24.6925 65.4367 25.0099 65.1053 25.2432 64.676C25.4765 64.2373 25.5932 63.724 25.5932 63.136ZM31.2881 67.126C30.7001 67.126 30.1728 67.028 29.7061 66.832C29.2395 66.6267 28.8708 66.3467 28.6001 65.992C28.3295 65.628 28.1801 65.2127 28.1521 64.746H29.4681C29.5055 65.1287 29.6828 65.4413 30.0001 65.684C30.3268 65.9267 30.7515 66.048 31.2741 66.048C31.7595 66.048 32.1421 65.9407 32.4221 65.726C32.7021 65.5113 32.8421 65.2407 32.8421 64.914C32.8421 64.578 32.6928 64.3307 32.3941 64.172C32.0955 64.004 31.6335 63.8407 31.0081 63.682C30.4388 63.5327 29.9721 63.3833 29.6081 63.234C29.2535 63.0753 28.9455 62.8467 28.6841 62.548C28.4321 62.24 28.3061 61.8387 28.3061 61.344C28.3061 60.952 28.4228 60.5927 28.6561 60.266C28.8895 59.9393 29.2208 59.6827 29.6501 59.496C30.0795 59.3 30.5695 59.202 31.1201 59.202C31.9695 59.202 32.6555 59.4167 33.1781 59.846C33.7008 60.2753 33.9808 60.8633 34.0181 61.61H32.7441C32.7161 61.2087 32.5528 60.8867 32.2541 60.644C31.9648 60.4013 31.5728 60.28 31.0781 60.28C30.6208 60.28 30.2568 60.378 29.9861 60.574C29.7155 60.77 29.5801 61.0267 29.5801 61.344C29.5801 61.596 29.6595 61.806 29.8181 61.974C29.9861 62.1327 30.1915 62.2633 30.4341 62.366C30.6861 62.4593 31.0315 62.5667 31.4701 62.688C32.0208 62.8373 32.4688 62.9867 32.8141 63.136C33.1595 63.276 33.4535 63.4907 33.6961 63.78C33.9481 64.0693 34.0788 64.4473 34.0881 64.914C34.0881 65.334 33.9715 65.712 33.7381 66.048C33.5048 66.384 33.1735 66.65 32.7441 66.846C32.3241 67.0327 31.8388 67.126 31.2881 67.126ZM42.6906 59.328V67H41.4166V65.866C41.1739 66.258 40.8333 66.566 40.3946 66.79C39.9653 67.0047 39.4893 67.112 38.9666 67.112C38.3693 67.112 37.8326 66.9907 37.3566 66.748C36.8806 66.496 36.5026 66.1227 36.2226 65.628C35.9519 65.1333 35.8166 64.5313 35.8166 63.822V59.328H37.0766V63.654C37.0766 64.41 37.2679 64.9933 37.6506 65.404C38.0333 65.8053 38.5559 66.006 39.2186 66.006C39.8999 66.006 40.4366 65.796 40.8286 65.376C41.2206 64.956 41.4166 64.3447 41.4166 63.542V59.328H42.6906ZM45.2477 67.084C45.005 67.084 44.7997 67 44.6317 66.832C44.4637 66.664 44.3797 66.4587 44.3797 66.216C44.3797 65.9733 44.4637 65.768 44.6317 65.6C44.7997 65.432 45.005 65.348 45.2477 65.348C45.481 65.348 45.677 65.432 45.8357 65.6C46.0037 65.768 46.0877 65.9733 46.0877 66.216C46.0877 66.4587 46.0037 66.664 45.8357 66.832C45.677 67 45.481 67.084 45.2477 67.084ZM57.0071 59.188C57.6045 59.188 58.1365 59.314 58.6031 59.566C59.0698 59.8087 59.4385 60.1773 59.7091 60.672C59.9798 61.1667 60.1151 61.7687 60.1151 62.478V67H58.8551V62.66C58.8551 61.8947 58.6638 61.3113 58.2811 60.91C57.9078 60.4993 57.3991 60.294 56.7551 60.294C56.0925 60.294 55.5651 60.5087 55.1731 60.938C54.7811 61.358 54.5851 61.9693 54.5851 62.772V67H53.3251V62.66C53.3251 61.8947 53.1338 61.3113 52.7511 60.91C52.3778 60.4993 51.8691 60.294 51.2251 60.294C50.5625 60.294 50.0351 60.5087 49.6431 60.938C49.2511 61.358 49.0551 61.9693 49.0551 62.772V67H47.7811V59.328H49.0551V60.434C49.3071 60.0327 49.6431 59.7247 50.0631 59.51C50.4925 59.2953 50.9638 59.188 51.4771 59.188C52.1211 59.188 52.6905 59.3327 53.1851 59.622C53.6798 59.9113 54.0485 60.336 54.2911 60.896C54.5058 60.3547 54.8605 59.9347 55.3551 59.636C55.8498 59.3373 56.4005 59.188 57.0071 59.188ZM69.205 62.87C69.205 63.1127 69.191 63.3693 69.163 63.64H63.031C63.0776 64.396 63.3343 64.9887 63.801 65.418C64.277 65.838 64.851 66.048 65.523 66.048C66.0736 66.048 66.531 65.922 66.895 65.67C67.2683 65.4087 67.5296 65.0633 67.679 64.634H69.051C68.8456 65.3713 68.435 65.9733 67.819 66.44C67.203 66.8973 66.4376 67.126 65.523 67.126C64.795 67.126 64.1416 66.9627 63.563 66.636C62.9936 66.3093 62.5456 65.8473 62.219 65.25C61.8923 64.6433 61.729 63.9433 61.729 63.15C61.729 62.3567 61.8876 61.6613 62.205 61.064C62.5223 60.4667 62.9656 60.0093 63.535 59.692C64.1136 59.3653 64.7763 59.202 65.523 59.202C66.251 59.202 66.895 59.3607 67.455 59.678C68.015 59.9953 68.4443 60.434 68.743 60.994C69.051 61.5447 69.205 62.17 69.205 62.87ZM67.889 62.604C67.889 62.1187 67.7816 61.7033 67.567 61.358C67.3523 61.0033 67.0583 60.7373 66.685 60.56C66.321 60.3733 65.915 60.28 65.467 60.28C64.823 60.28 64.2723 60.4853 63.815 60.896C63.367 61.3067 63.1103 61.876 63.045 62.604H67.889Z"
            fill="white"
          />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.2)",
            borderRadius: "50px ",
            marginTop: "10rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "1000px",
              height: "auto",
              maxWidth: "700px",
              padding: "2.2rem 3rem 2.2rem 3rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: `linear-gradient(to bottom right, ${getColors(data.theme).primary}, ${getColors(data.theme).secondary})`,
            }}
          >
            <h1
              style={{
                color: "white",
                fontWeight: "bold",
                fontFamily: '"Open Sans - Bold"',
                fontSize: "2.5rem",
                textAlign: "center",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {data.message}
            </h1>
          </div>

          <div
            style={{
              width: "1000px",
              height: "auto",
              maxWidth: "700px",
              padding: "2.2rem 3rem 2.2rem 3rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
            }}
          >
            <h1
              style={{
                color: "black",
                fontFamily: '"Open Sans - Bold"',
                fontSize: "2.5rem",
                textAlign: "center",
              }}
            >
              {data.answer}
            </h1>

            <p
              style={{
                opacity: "0.5",
                fontSize: "1.5rem",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {data.code_name}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        {
          name: "Open Sans",
          data: openSansRegular,
          style: "normal",
        },
        {
          name: "Open Sans - Bold",
          data: openSansBold,
          style: "normal",
        },
        {
          name: "Open Sans - Semi Bold",
          data: openSansSemiBold,
          style: "normal",
        },
      ],
    },
  );
}