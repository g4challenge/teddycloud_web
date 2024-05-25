import { useEffect, useState } from "react";
import { defaultAPIConfig } from "../config/defaultApiConfig";
import { TeddyCloudApi } from "../api";

const api = new TeddyCloudApi(defaultAPIConfig());

interface Image {
    src: string;
    id: number;
    top: string;
    left: string;
}

interface TonieMeetingElementProps {
    maxNoOfGuests: number;
    toniesSize: number;
    showQuestionMark: boolean;
    title?: string;
    description?: string;
    height?: number;
    width?: number;
}

const questionMarkSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="100%" viewBox="0 0 512 512">
        <path
            fill="none"
            opacity="1.000000"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="15.000000"
            d=" M285.000000,95.000000   C285.726776,91.291718 284.143219,89.788498 280.551392,88.369873   C247.948990,75.493263 212.672882,91.508270 199.495224,122.998001   C196.613541,129.884201 195.385559,137.055237 195.485504,144.500198   C195.559326,149.999207 195.570007,155.501114 195.483032,160.999725   C195.362961,168.591705 191.442429,172.487579 184.000000,172.494614   C166.333344,172.511307 148.666656,172.510849 131.000000,172.494736   C123.739044,172.488113 119.744461,168.704391 119.512695,161.499588   C118.937752,143.626343 119.484947,125.767700 124.620247,108.535835   C129.305405,92.814384 136.600082,78.329407 146.361160,64.899094   C160.063324,46.046219 177.407562,31.600046 198.103745,21.717247   C219.862259,11.327159 243.132431,6.942070 267.508698,8.891317   C284.115204,10.219257 299.968292,14.037633 314.973419,21.056805   C338.704193,32.157684 357.928345,48.584900 372.550323,70.466385   C383.991730,87.588272 391.730164,106.267952 394.317322,126.523338   C399.345093,165.887207 389.786652,201.671356 364.978485,232.982956   C350.265991,251.552322 331.599060,265.211121 309.924530,274.320435   C296.501526,279.961792 282.229004,283.352203 267.499878,283.997559   C263.333923,284.180115 259.162445,284.263275 255.000793,284.513092   C242.331039,285.273529 234.536453,294.940430 234.510101,310.000031   C234.471024,332.333282 234.502640,354.666656 234.498566,377.000000   C234.497147,384.740631 230.771179,388.486389 223.000000,388.494385   C205.666687,388.512268 188.326492,388.221069 171.003571,388.645569   C164.614304,388.802094 159.267792,383.378479 159.354935,376.998016   C159.705429,351.336151 159.031464,325.655487 159.642624,300.003387   C160.167542,277.971313 168.603424,258.489746 183.103546,242.091568   C198.977600,224.139587 218.895264,213.013474 242.995743,209.966385   C250.478912,209.020279 258.084564,209.344330 265.476685,208.330063   C284.746246,205.686066 300.188782,196.120834 310.413757,179.447113   C323.347626,158.355911 322.759064,136.763321 311.652649,114.922371   C309.739319,111.159721 306.957031,112.566917 304.500000,111.750000  "
        />
        <path
            fill="none"
            opacity="1.000000"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="15.000000"
            d=" M197.500000,506.500000   C203.208725,504.136566 209.499985,503.955261 215.081406,500.636932   C226.722000,493.716095 233.515152,484.355804 234.104324,470.504425   C234.416428,463.166840 234.755539,456.042480 232.056686,448.978333   C227.973969,438.291962 214.538635,425.846741 198.510223,425.232910   C181.959915,424.599152 164.725250,435.753998 160.707718,453.048248   C155.331696,476.190460 163.819122,500.451569 192.494766,505.032776   C194.035324,505.278900 195.500000,506.000000 197.000000,506.500000  "
        />
    </svg>
);

export const TonieMeetingElement: React.FC<TonieMeetingElementProps> = ({
    maxNoOfGuests,
    toniesSize,
    showQuestionMark,
    title,
    description,
    height,
    width,
}) => {
    const [randomizedImages, setRandomizedImages] = useState<Image[]>([]);

    useEffect(() => {
        const fetchTonies = async () => {
            // Perform API call to fetch Tonie data
            const tonieData = (await api.apiGetTagIndexMergedAllOverlays())
                .sort((a, b) => {
                    if (Math.random() > 0.5) {
                        return Math.floor(-100 * Math.random());
                    } else {
                        return Math.floor(100 * Math.random());
                    }
                })
                .filter(
                    (item) =>
                        !item.tonieInfo.picture.endsWith("/img_unknown.png") &&
                        item.tonieInfo.picture !== null &&
                        item.tonieInfo.picture !== undefined &&
                        item.tonieInfo.picture !== "" &&
                        !item.nocloud
                )
                .slice(0, maxNoOfGuests);

            const allImages = tonieData.flatMap((item) => item.tonieInfo.picture);

            const parentWidth = width ? width : document.getElementById("collage-container")?.clientWidth || 0;
            const parentHeight = height ? height : document.getElementById("collage-container")?.clientHeight || 0;

            const shuffledImages = allImages.map((src, index) => {
                if (title && description) {
                    const centerVertical = 50;
                    const centerHorizontal = 50;
                    const centerWidth = (document.getElementById("central-text")?.clientWidth || 0) / 2;
                    const centerHeight = (document.getElementById("central-text")?.clientHeight || 0) / 2;

                    let top, left;
                    do {
                        top = Math.random() * (100 - (toniesSize / parentHeight) * 100);
                        left = Math.random() * (100 - (toniesSize / parentWidth) * 100);
                    } while (
                        top >
                            centerVertical - (centerHeight / parentHeight) * 100 - (toniesSize / parentHeight) * 100 &&
                        top < centerVertical + (centerHeight / parentHeight) * 100 &&
                        left >
                            centerHorizontal - (centerWidth / parentWidth) * 100 - (toniesSize / parentWidth) * 100 &&
                        left < centerHorizontal + (centerWidth / parentWidth) * 100
                    );
                    return {
                        src: src,
                        id: index,
                        top: `${top}%`,
                        left: `${left}%`,
                    };
                } else {
                    const top = Math.random() * (100 - (toniesSize / parentHeight) * 100);
                    const left = Math.random() * (100 - (toniesSize / parentWidth) * 100);

                    return {
                        src: src,
                        id: index,
                        top: `${top}%`,
                        left: `${left}%`,
                    };
                }
            });

            setRandomizedImages(shuffledImages);
        };

        fetchTonies();
    }, [description, height, maxNoOfGuests, title, toniesSize, width]);

    return (
        <div
            id="collage-container"
            className="collage-container"
            style={{
                display: "flex",
                position: "relative",
                width: width ? `${width}px` : "100%",
                height: height ? `${height}px` : "60vh",
            }}
        >
            {title && description && (
                <div
                    id="central-text"
                    className="central-text"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        background: "white",
                        padding: "10px",
                        textAlign: "center",
                        pointerEvents: "none",
                    }}
                >
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            )}
            {randomizedImages.map((image) => (
                <div
                    key={image.id}
                    className="collage-image-container"
                    style={{
                        position: "absolute",
                        top: image.top,
                        left: image.left,
                        width: "150px",
                        height: "150px",
                        overflow: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    <img
                        src={image.src}
                        alt={`Random ${image.id}`}
                        className="collage-image"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                    {showQuestionMark && (
                        <div
                            className="question-mark-overlay"
                            style={{
                                position: "absolute",
                                top: "5%",
                                right: "20%",
                                width: "30%",
                                height: "30%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {questionMarkSVG}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
